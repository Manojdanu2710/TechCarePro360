import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import crypto from 'crypto';

// Initialize Razorpay (if available)
let Razorpay = null;
let razorpay = null;

try {
  const razorpayModule = await import('razorpay');
  Razorpay = razorpayModule.default;
  
  // Create Razorpay instance if credentials are available
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  } else {
    console.warn('Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
  }
} catch (error) {
  console.warn('Razorpay not installed. Install with: npm install razorpay');
}

// Create payment order (for online payments)
export const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and amount are required'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ booking: bookingId });
    if (existingPayment && existingPayment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this booking'
      });
    }

    // If Razorpay is configured, create order
    if (razorpay) {
      const options = {
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `booking_${bookingId}_${Date.now()}`,
        notes: {
          bookingId: bookingId.toString()
        }
      };

      const order = await razorpay.orders.create(options);

      // Create or update payment record
      const payment = existingPayment
        ? await Payment.findByIdAndUpdate(
            existingPayment._id,
            {
              amount,
              razorpayOrderId: order.id,
              status: 'processing'
            },
            { new: true }
          )
        : await Payment.create({
            booking: bookingId,
            amount,
            paymentMethod: 'online',
            razorpayOrderId: order.id,
            status: 'processing'
          });

      res.status(200).json({
        success: true,
        message: 'Payment order created',
        data: {
          orderId: order.id,
          amount: order.amount / 100,
          currency: order.currency,
          key: process.env.RAZORPAY_KEY_ID,
          paymentId: payment._id
        }
      });
    } else {
      // Razorpay not configured, create manual payment record
      const payment = existingPayment
        ? await Payment.findByIdAndUpdate(
            existingPayment._id,
            { amount, status: 'pending' },
            { new: true }
          )
        : await Payment.create({
            booking: bookingId,
            amount,
            paymentMethod: 'cash',
            status: 'pending'
          });

      res.status(200).json({
        success: true,
        message: 'Payment record created (Razorpay not configured)',
        data: {
          paymentId: payment._id,
          amount,
          paymentMethod: 'cash'
        }
      });
    }
  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating payment order'
    });
  }
};

// Verify payment (Razorpay webhook/callback)
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification data missing'
      });
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update payment record
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'completed',
        paidAt: new Date(),
        transactionId: razorpay_payment_id
      },
      { new: true }
    ).populate('booking');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Update booking payment method
    await Booking.findByIdAndUpdate(payment.booking._id, {
      paymentMethod: 'online'
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: payment
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error verifying payment'
    });
  }
};

// Get all payments (Admin)
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('booking', 'name phone email serviceType status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Payments fetched successfully',
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching payments'
    });
  }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id)
      .populate('booking');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment fetched successfully',
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching payment'
    });
  }
};

// Update payment status (Admin)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status || !['pending', 'processing', 'completed', 'failed', 'refunded'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }

    const updateData = { status };
    if (status === 'completed' && !req.body.paidAt) {
      updateData.paidAt = new Date();
    }
    if (status === 'refunded') {
      updateData.refundedAt = new Date();
      updateData.refundAmount = req.body.refundAmount || 0;
    }
    if (notes) {
      updateData.notes = notes;
    }

    const payment = await Payment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('booking');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating payment status'
    });
  }
};

