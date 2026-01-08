# TechCare Pro360 Backend API

Complete backend API for TechCare Pro360 - AMC & Home IT Services Platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Booking Management**: Create and manage service bookings
- **Contact Form**: Handle customer inquiries
- **Staff Management**: Add, update, and manage staff members
- **Admin Authentication**: Secure JWT-based admin login
- **Service Listing**: Get available AMC and Home IT services
- **Booking Assignment**: Assign staff to bookings
- **Status Updates**: Track booking status (pending, assigned, completed, cancelled)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone or navigate to the project directory**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the following variables:
     ```
     MONGO_URI=your-mongodb-connection-string
     JWT_SECRET=your-secret-jwt-key
     PORT=5000
     ```

4. **Start MongoDB**
   - If using local MongoDB, ensure it's running
   - For MongoDB Atlas, use your connection string in `MONGO_URI`

5. **Run the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Public Endpoints (No Authentication)

#### Book Service
```
POST /api/book-service
Body: {
  "name": "John Doe",
  "phone": "6397869822",
  "email": "john@example.com",
  "city": "Haldwani",
  "address": "123 Main St",
  "serviceType": "PC/Laptop AMC",
  "preferredDate": "2024-01-15",
  "preferredTime": "10:00",
  "paymentMethod": "UPI"
}
```

#### Contact Form
```
POST /api/contact
Body: {
  "name": "Jane Doe",
  "phone": "9876543210",
  "email": "jane@example.com",
  "subject": "Inquiry",
  "message": "I need help with..."
}
```

#### Get Services
```
GET /api/services
```

### Admin Endpoints (Authentication Required)

#### Admin Login
```
POST /api/admin/login
Body: {
  "email": "admin@techcare.com",
  "password": "your-password"
}
Response: {
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "admin": { ... }
  }
}
```

#### Get All Bookings
```
GET /api/admin/bookings
Headers: {
  "Authorization": "Bearer <token>"
}
```

#### Assign Staff to Booking
```
PUT /api/admin/assign-staff/:bookingId
Headers: {
  "Authorization": "Bearer <token>"
}
Body: {
  "staffId": "staff-object-id"
}
```

#### Update Booking Status
```
PUT /api/admin/update-status/:bookingId
Headers: {
  "Authorization": "Bearer <token>"
}
Body: {
  "status": "completed" // pending, assigned, completed, cancelled
}
```

#### Staff Management
```
GET /api/admin/staff          // Get all staff
POST /api/admin/staff          // Create staff
GET /api/admin/staff/:id       // Get staff by ID
PUT /api/admin/staff/:id       // Update staff
DELETE /api/admin/staff/:id    // Delete staff
```

#### Get Contact Messages
```
GET /api/admin/contacts
Headers: {
  "Authorization": "Bearer <token>"
}
```

## 🔐 Admin Setup

To create an admin account, you can use MongoDB shell or a tool like MongoDB Compass:

```javascript
// In MongoDB shell or Compass
use techcare-pro360

db.admins.insertOne({
  email: "admin@techcare.com",
  password: "$2a$10$..." // Use bcrypt to hash password
})
```

Or create a setup script:

```javascript
// utils/createAdmin.js
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import connectDB from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();
connectDB();

const createAdmin = async () => {
  const email = 'admin@techcare.com';
  const password = 'admin123'; // Change this!

  const admin = await Admin.create({
    email,
    password
  });

  console.log('Admin created:', admin.email);
  process.exit();
};

createAdmin();
```

## 📁 Project Structure

```
techcare-pro360-backend/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── adminController.js   # Admin authentication
│   ├── bookingController.js # Booking operations
│   ├── contactController.js # Contact form handling
│   ├── serviceController.js # Service listing
│   └── staffController.js   # Staff management
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── Admin.js             # Admin model
│   ├── Booking.js           # Booking model
│   ├── Contact.js            # Contact model
│   └── Staff.js             # Staff model
├── routes/
│   ├── adminRoutes.js        # Admin routes
│   ├── bookingRoutes.js      # Booking routes
│   ├── contactRoutes.js      # Contact routes
│   ├── serviceRoutes.js      # Service routes
│   └── staffRoutes.js        # Staff routes
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── README.md
└── server.js                # Main server file
```

## 🚢 Deployment

### Deploy to Render

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PORT` (Render will set this automatically)
5. Deploy!

### Deploy to Railway

1. Push your code to GitHub
2. Create a new project on Railway
3. Add MongoDB service or use external MongoDB
4. Set environment variables
5. Deploy!

### Deploy to Vercel

Note: Vercel is optimized for serverless functions. For a full Express app, consider Render or Railway.

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/techcare-pro360` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |

## 📝 Response Format

All API responses follow this format:

```json
{
  "success": true/false,
  "message": "Response message",
  "data": { ... }
}
```

## 🐛 Error Handling

Errors are returned in a consistent format:

```json
{
  "success": false,
  "message": "Error message"
}
```

## 📞 Support

For issues or questions, contact the development team.

## 📄 License

ISC

---

**TechCare Pro360** - Fast & Reliable AMC & IT Services at Your Doorstep

