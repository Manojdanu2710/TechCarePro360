# Quick Setup Guide

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Configure Environment
1. Copy `.env.example` to `.env`
2. Update the following:
   - `MONGO_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A strong random string (use: `openssl rand -base64 32`)
   - `PORT` - Server port (default: 5000)

## Step 3: Create Admin Account
```bash
npm run create-admin
```

Default credentials:
- Email: `admin@techcare.com`
- Password: `admin123`

**⚠️ Change the password immediately after first login!**

## Step 4: Start the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Step 5: Test the API

### Health Check
```bash
curl http://localhost:5000/
```

### Test Booking
```bash
curl -X POST http://localhost:5000/api/book-service \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "6397869822",
    "email": "test@example.com",
    "city": "Haldwani",
    "address": "123 Test St",
    "serviceType": "PC/Laptop AMC",
    "preferredDate": "2024-01-15",
    "preferredTime": "10:00"
  }'
```

### Test Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@techcare.com",
    "password": "admin123"
  }'
```

## MongoDB Setup Options

### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use: `mongodb://localhost:27017/techcare-pro360`

### Option 2: MongoDB Atlas (Cloud)
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update `MONGO_URI` in `.env`

## Frontend Integration

Update your frontend API calls to point to:
- Development: `http://localhost:5000/api`
- Production: `https://your-backend-url.com/api`

### Example: Update booking form in `assets/js/main.js`
```javascript
// Replace the booking form submission with:
fetch('http://localhost:5000/api/book-service', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(bookingData)
})
```

## Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running
- Verify `MONGO_URI` in `.env`
- Check firewall settings

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process using port 5000

### JWT Token Error
- Ensure `JWT_SECRET` is set in `.env`
- Use a strong, random secret key

## Next Steps

1. Update frontend to connect to backend API
2. Set up email notifications (optional)
3. Add payment gateway integration (optional)
4. Deploy to production (Render/Railway)

