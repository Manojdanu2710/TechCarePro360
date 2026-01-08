import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import bookingRoutes from './routes/bookingRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', bookingRoutes);
app.use('/api', contactRoutes);
app.use('/api', serviceRoutes);
app.use('/api', adminRoutes);
app.use('/api', staffRoutes);
app.use('/api', paymentRoutes);

// Health check route (API only)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TechCare Pro360 API is running',
    version: '1.0.0'
  });
});

// Fix for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔐 Serve Admin Frontend
app.use('/admin', express.static(path.join(__dirname, 'admin-frontend')));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-frontend', 'index.html'));
});

// 🌍 Serve Public Frontend (root folder)
app.use(express.static(__dirname));

// For all non-API routes, serve main index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/admin')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

// 404 handler for unmatched API routes
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ success: false, message: 'Route not found' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
