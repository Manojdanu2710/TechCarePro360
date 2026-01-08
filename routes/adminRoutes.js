import express from 'express';
import { adminLogin, getAdminProfile } from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.post('/admin/login', adminLogin);

// Protected route
router.get('/admin/profile', protect, getAdminProfile);

export default router;

