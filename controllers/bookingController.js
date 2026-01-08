import Booking from '../models/Booking.js';

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { name, phone, email, city, address, serviceType, preferredDate, preferredTime, paymentMethod } = req.body;

    // Validation
    if (!name || !phone || !address || !serviceType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, phone, address, serviceType'
      });
    }

    const booking = await Booking.create({
      name,
      phone,
      email,
      city,
      address,
      serviceType,
      preferredDate,
      preferredTime,
      paymentMethod
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating booking'
    });
  }
};

// Get all bookings (Admin)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('assignedStaff', 'name phone location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Bookings fetched successfully',
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching bookings'
    });
  }
};

// Assign staff to booking
export const assignStaff = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { staffId } = req.body;

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: 'Staff ID is required'
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        assignedStaff: staffId,
        status: 'assigned'
      },
      { new: true }
    ).populate('assignedStaff', 'name phone location');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Staff assigned successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error assigning staff'
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'assigned', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (pending, assigned, completed, cancelled)'
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    ).populate('assignedStaff', 'name phone location');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating booking status'
    });
  }
};

