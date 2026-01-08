import express from 'express';
import { createBooking, getAllBookings, assignStaff, updateBookingStatus } from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.post('/book-service', createBooking);

// Admin routes (protected)
router.get('/admin/bookings', protect, getAllBookings);
router.put('/admin/assign-staff/:bookingId', protect, assignStaff);
router.put('/admin/update-status/:bookingId', protect, updateBookingStatus);

export default router;

