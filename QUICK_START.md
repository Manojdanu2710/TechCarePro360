# Quick Start Guide - Updated TechCare Pro360

## 🚀 Quick Setup (5 Minutes)

### 1. Install Dependencies

```bash
# Backend
npm install

# Admin Frontend
cd admin-frontend
npm install
cd ..
```

### 2. Configure Environment

Create/update `.env` in root directory:

```env
MONGO_URI=mongodb://localhost:27017/techcare-pro360
JWT_SECRET=your-secret-key-here
PORT=5000

# Optional: Razorpay (for online payments)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### 3. Seed Initial Data

```bash
# Seed services
npm run seed-services

# Create admin user
npm run create-admin
```

### 4. Start Servers

**Terminal 1 - Backend:**
```bash
npm start
# or
npm run dev
```

**Terminal 2 - Admin Frontend:**
```bash
cd admin-frontend
npm run dev
```

### 5. Access Points

- **Public Website:** Open `index.html` in browser
- **Admin Panel:** http://localhost:5173/admin/login
- **Backend API:** http://localhost:5000

## ✅ What's New

### Dynamic Services
- ✅ Services stored in MongoDB
- ✅ Admin can Create/Edit/Delete services
- ✅ Public website fetches services dynamically
- ✅ Prices update automatically

### Payment Integration
- ✅ Payment tracking with status management
- ✅ Razorpay integration (optional)
- ✅ Payment history in admin panel
- ✅ Refund support

## 🧪 Quick Test

1. **Test Services:**
   - Login to admin panel
   - Go to Services → Create new service
   - Open booking.html → Verify service appears

2. **Test Payments:**
   - Create booking with "Online Payment"
   - Complete payment (if Razorpay configured)
   - Check admin Payments page

## 📚 Full Documentation

See `IMPLEMENTATION_GUIDE.md` for complete details.

## 🆘 Troubleshooting

**Services not showing?**
```bash
npm run seed-services
```

**Payment not working?**
- Check Razorpay credentials in `.env`
- Restart backend after adding credentials

**Can't login?**
```bash
npm run create-admin
```

---

**All existing functionality preserved. Backward compatible!**

