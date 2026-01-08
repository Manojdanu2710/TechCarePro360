import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes (for payment processing)
router.post('/payment/create-order', createPaymentOrder);
router.post('/payment/verify', verifyPayment);

// Admin routes (protected)
router.get('/admin/payments', protect, getAllPayments);
router.get('/admin/payments/:id', protect, getPaymentById);
router.put('/admin/payments/:id/status', protect, updatePaymentStatus);

export default router;

