import express from 'express';
import { createContact, getAllContacts } from '../controllers/contactController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.post('/contact', createContact);

// Admin route (protected)
router.get('/admin/contacts', protect, getAllContacts);

export default router;

