# TechCare Pro360 - Implementation Guide

## 🎯 Overview

This guide documents all the changes made to transform TechCare Pro360 from static services to a fully dynamic system with payment integration.

## ✅ Changes Implemented

### 1. Dynamic Services System

#### Backend Changes

**New Model:** `models/Service.js`
- Stores service name, description, category (amc/homeIT), price, basePrice, active status
- Supports display ordering

**Updated Controller:** `controllers/serviceController.js`
- `getServices()` - Public endpoint (returns only active services)
- `getAllServices()` - Admin endpoint (returns all services including inactive)
- `getServiceById()` - Get single service
- `createService()` - Create new service
- `updateService()` - Update existing service
- `deleteService()` - Delete service

**Updated Routes:** `routes/serviceRoutes.js`
- `GET /api/services` - Public (active services only)
- `GET /api/admin/services` - Admin (all services)
- `GET /api/admin/services/:id` - Admin (single service)
- `POST /api/admin/services` - Admin (create)
- `PUT /api/admin/services/:id` - Admin (update)
- `DELETE /api/admin/services/:id` - Admin (delete)

#### Frontend Changes

**Admin Panel:** `admin-frontend/src/admin/pages/Services.jsx`
- Full CRUD interface with table view
- Search and filter by category
- Create/Edit modal forms
- Delete with confirmation
- Active/Inactive status toggle
- Display order management

**Public Website:** `assets/js/main.js`
- `fetchServices()` - Fetches services from API
- `populateServiceDropdowns()` - Dynamically populates service dropdowns
- Services now load from database instead of hardcoded values
- Prices update automatically when admin changes them

### 2. Payment Integration (Razorpay)

#### Backend Changes

**New Model:** `models/Payment.js`
- Tracks payment amount, method, status
- Stores Razorpay transaction IDs
- Supports refunds
- Links to booking

**New Controller:** `controllers/paymentController.js`
- `createPaymentOrder()` - Creates Razorpay order
- `verifyPayment()` - Verifies Razorpay payment signature
- `getAllPayments()` - Admin: Get all payments
- `getPaymentById()` - Admin: Get single payment
- `updatePaymentStatus()` - Admin: Update payment status

**New Routes:** `routes/paymentRoutes.js`
- `POST /api/payment/create-order` - Public (create payment order)
- `POST /api/payment/verify` - Public (verify payment)
- `GET /api/admin/payments` - Admin (list all payments)
- `GET /api/admin/payments/:id` - Admin (get payment)
- `PUT /api/admin/payments/:id/status` - Admin (update status)

**Updated:** `server.js`
- Added payment routes

#### Frontend Changes

**Admin Panel:** `admin-frontend/src/admin/pages/Payments.jsx`
- Shows live payment status from Payment model
- Payment statistics (total, completed, pending, revenue)
- Filter by status and payment method
- Update payment status with notes
- Refund handling

**Public Website:** `assets/js/main.js`
- `handleOnlinePayment()` - Initiates payment flow
- `initiateRazorpayPayment()` - Loads Razorpay SDK
- `openRazorpayCheckout()` - Opens Razorpay checkout
- Payment verification after successful payment
- Falls back gracefully if Razorpay not configured

**Updated API Client:** `admin-frontend/src/utils/adminApi.js`
- Added service CRUD functions
- Added payment management functions
- Added payment processing functions

### 3. Public Website Dynamic Updates

**Updated:** `assets/js/main.js`
- Services fetched from API on page load
- Service dropdowns populated dynamically
- Prices reflect current database values
- API base URL configurable via `window.API_BASE_URL`
- Falls back to `http://localhost:5000/api` if not set

## 📦 New Dependencies

### Backend
```bash
npm install razorpay
```

### Frontend
No new dependencies required (Razorpay SDK loaded from CDN)

## 🔧 Environment Variables

### Backend `.env` (Add these)

```env
# Existing variables
MONGO_URI=mongodb://localhost:27017/techcare-pro360
JWT_SECRET=your-secret-key-here
PORT=5000

# New: Razorpay Configuration (Optional - payment works without it)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Optional: Email configuration (for future email notifications)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
```

### Frontend Configuration

**Option 1:** Set in HTML (before main.js loads)
```html
<script>
  window.API_BASE_URL = 'http://localhost:5000/api';
</script>
<script src="assets/js/main.js"></script>
```

**Option 2:** Defaults to `http://localhost:5000/api` if not set

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
# Backend
npm install

# Admin Frontend
cd admin-frontend
npm install
cd ..
```

### Step 2: Configure Environment

1. Create/update `.env` file in root directory
2. Add Razorpay credentials (optional for now)
3. Ensure MongoDB is running

### Step 3: Seed Initial Services

```bash
npm run seed-services
```

This will create the default services in the database.

### Step 4: Create Admin User

```bash
npm run create-admin
```

### Step 5: Start Backend

```bash
npm start
# or for development
npm run dev
```

### Step 6: Start Admin Frontend

```bash
cd admin-frontend
npm run dev
```

### Step 7: Test Public Website

Open HTML files in browser or serve via web server.

## 🧪 Testing Guide

### Test Dynamic Services

1. **Admin Panel:**
   - Login to admin panel
   - Go to Services page
   - Create a new service
   - Edit an existing service
   - Change price and verify it updates

2. **Public Website:**
   - Open booking.html
   - Check service dropdown - should show services from database
   - Verify prices match admin panel

### Test Payment Integration

1. **Without Razorpay (Cash/Manual):**
   - Create booking with "Cash on Delivery"
   - Check admin Payments page - should show pending payment
   - Update payment status to "completed"

2. **With Razorpay:**
   - Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`
   - Restart backend
   - Create booking with "Online Payment"
   - Should open Razorpay checkout
   - Complete test payment
   - Verify payment appears in admin panel as "completed"

### Test Payment Status Updates

1. Go to admin Payments page
2. Click "Update Status" on any payment
3. Change status to "completed" or "refunded"
4. Add notes
5. Verify status updates in table

## 📝 API Endpoints Summary

### Services (New)

```
GET    /api/services                    # Public: Get active services
GET    /api/admin/services              # Admin: Get all services
GET    /api/admin/services/:id          # Admin: Get service by ID
POST   /api/admin/services              # Admin: Create service
PUT    /api/admin/services/:id          # Admin: Update service
DELETE /api/admin/services/:id          # Admin: Delete service
```

### Payments (New)

```
POST   /api/payment/create-order        # Public: Create payment order
POST   /api/payment/verify              # Public: Verify payment
GET    /api/admin/payments              # Admin: Get all payments
GET    /api/admin/payments/:id         # Admin: Get payment by ID
PUT    /api/admin/payments/:id/status  # Admin: Update payment status
```

## 🔄 Migration from Static to Dynamic

### Services Migration

**Before:**
- Services hardcoded in `serviceController.js`
- No way to update prices
- Admin panel read-only

**After:**
- Services stored in MongoDB
- Full CRUD in admin panel
- Public website fetches dynamically
- Prices update automatically

### Payment Migration

**Before:**
- Payment method stored as string in booking
- No payment tracking
- No payment status

**After:**
- Separate Payment model
- Payment status tracking
- Razorpay integration (optional)
- Refund support
- Payment history

## ⚠️ Important Notes

### Razorpay Setup (Optional)

1. Sign up at https://razorpay.com
2. Get API keys from dashboard
3. Add to `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=your_secret_key
   ```
4. For production, use live keys

### Payment Flow

1. User selects "Online Payment" in booking form
2. Backend creates Razorpay order
3. Frontend opens Razorpay checkout
4. User completes payment
5. Razorpay redirects with payment details
6. Backend verifies payment signature
7. Payment status updated to "completed"
8. Booking confirmed

### Fallback Behavior

- If Razorpay not configured: Payment works as "Cash on Delivery"
- If API unavailable: Public website shows error message
- If services not loaded: Booking form shows empty dropdown

## 🐛 Troubleshooting

### Services not loading in public website

1. Check backend is running
2. Check API_BASE_URL is correct
3. Check browser console for errors
4. Verify services exist in database: `npm run seed-services`

### Payment not working

1. Check Razorpay credentials in `.env`
2. Restart backend after adding credentials
3. Check browser console for Razorpay SDK errors
4. Verify payment endpoint is accessible

### Admin panel can't create services

1. Check JWT token is valid
2. Check admin is logged in
3. Check network tab for API errors
4. Verify service routes are registered in server.js

## 📊 Database Schema Updates

### New Collections

**services:**
```javascript
{
  name: String,
  description: String,
  category: 'amc' | 'homeIT',
  price: String,
  basePrice: Number,
  currency: String (default: 'INR'),
  active: Boolean,
  displayOrder: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**payments:**
```javascript
{
  booking: ObjectId (ref: 'Booking'),
  amount: Number,
  currency: String (default: 'INR'),
  paymentMethod: 'cash' | 'online' | 'card' | 'upi' | 'wallet',
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded',
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  transactionId: String,
  paidAt: Date,
  refundedAt: Date,
  refundAmount: Number,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎉 What's Working Now

✅ Services fully dynamic (CRUD in admin, auto-updates on public site)  
✅ Payment tracking with status management  
✅ Razorpay integration (optional)  
✅ Public website fetches services from API  
✅ Admin can update service prices and they reflect immediately  
✅ Payment history and statistics in admin panel  
✅ Refund support  
✅ All existing functionality preserved  

## 🔮 Future Enhancements (Optional)

- Email notifications (Nodemailer integration)
- Real-time updates (Socket.io)
- Advanced payment analytics
- Service categories/subcategories
- Service images upload
- Bulk service operations

---

**All changes are backward compatible. Existing bookings and data remain intact.**

