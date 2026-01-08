import express from 'express';
import {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffById
} from '../controllers/staffController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All staff routes are protected (admin only)
router.get('/admin/staff', protect, getAllStaff);
router.post('/admin/staff', protect, createStaff);
router.get('/admin/staff/:id', protect, getStaffById);
router.put('/admin/staff/:id', protect, updateStaff);
router.delete('/admin/staff/:id', protect, deleteStaff);

export default router;

