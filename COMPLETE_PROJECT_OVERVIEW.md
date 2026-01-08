# TechCare Pro360 - Complete Project Overview (A to Z)

## 📋 Table of Contents
1. [Project Architecture](#project-architecture)
2. [Frontend (Public Website)](#frontend-public-website)
3. [Backend API](#backend-api)
4. [Database & Models](#database--models)
5. [Admin Panel](#admin-panel)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [Authentication & Authorization](#authentication--authorization)
8. [Bookings & Payments Flow](#bookings--payments-flow)
9. [Environment Configuration](#environment-configuration)
10. [File Structure](#file-structure)
11. [Current Limitations & Issues](#current-limitations--issues)

---

## 🏗️ Project Architecture

### Technology Stack

**Public Frontend:**
- Static HTML/CSS/JavaScript
- Bootstrap 5.3.3
- Font Awesome 6.5.0
- Vanilla JavaScript (no framework)

**Admin Frontend:**
- React 19.2.0
- Vite 7.2.4 (build tool)
- React Router DOM 7.9.6
- Tailwind CSS 3.4.14
- Axios 1.13.2
- Recharts 3.4.1 (for charts)

**Backend:**
- Node.js (ES Modules)
- Express.js 4.18.2
- MongoDB with Mongoose 8.5.1
- JWT (jsonwebtoken 9.0.2)
- bcryptjs 2.4.3 (password hashing)
- CORS enabled

**Database:**
- MongoDB (NoSQL)
- Collections: `admins`, `bookings`, `contacts`, `staff`

---

## 🌐 Frontend (Public Website)

### Technology
- **Type:** Static HTML pages with vanilla JavaScript
- **Styling:** Bootstrap 5.3.3 + Custom CSS
- **Icons:** Font Awesome 6.5.0
- **No Build Process:** Direct HTML files served

### Folder Structure
```
/
├── index.html              # Homepage
├── about.html              # About page
├── services.html           # Services listing
├── booking.html            # Booking form (connects to API)
├── contact.html            # Contact form (connects to API)
├── testimonials.html       # Testimonials page
├── faq.html                # FAQ page
├── blog.html               # Blog page
└── assets/
    ├── css/
    │   └── style.css       # Custom styles
    ├── js/
    │   └── main.js         # All JavaScript logic
    └── img/                # Images (logos, backgrounds, team photos)
```

### How Pages Work

#### 1. **Static Pages** (index.html, about.html, services.html, etc.)
- Pure HTML with Bootstrap styling
- No data fetching
- Static content only

#### 2. **Dynamic Pages** (booking.html, contact.html)

**Booking Page (`booking.html`):**
- Form submission handled in `assets/js/main.js`
- Submits to: `POST http://localhost:5000/api/book-service`
- Fields: name, phone, email, city, address, serviceType, preferredDate, preferredTime, paymentMethod
- Shows success/error alerts
- Pre-fills form from URL query params (for quick booking from homepage)

**Contact Page (`contact.html`):**
- Form submission handled in `assets/js/main.js`
- Submits to: `POST http://localhost:5000/api/contact`
- Fields: name, phone, email, subject, message
- Shows success/error alerts

### JavaScript Logic (`assets/js/main.js`)

**Features:**
1. **Year Display:** Sets current year in footer
2. **Active Nav:** Highlights current page in navigation
3. **Newsletter Form:** Dummy handler (just shows alert)
4. **Quick Booking:** Redirects to booking.html with prefilled query params
5. **Booking Form:**
   - Prefills from URL query params
   - Shows "nearest technician" based on city (hardcoded mapping)
   - Submits to backend API
   - Handles loading states and errors
6. **Contact Form:**
   - Submits to backend API
   - Handles loading states and errors

### Data Flow (Public Frontend)
```
User fills form → JavaScript (main.js) → Fetch API → Backend → MongoDB
                                                      ↓
                                              Response → Alert to user
```

**Note:** All API calls are hardcoded to `http://localhost:5000/api` in `main.js`

---

## 🔧 Backend API

### Technology
- **Framework:** Express.js 4.18.2
- **Database:** MongoDB with Mongoose 8.5.1
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **CORS:** Enabled for all origins

### Folder Structure
```
/
├── server.js                    # Entry point, Express app setup
├── config/
│   └── db.js                    # MongoDB connection
├── models/                      # Mongoose schemas
│   ├── Admin.js
│   ├── Booking.js
│   ├── Contact.js
│   └── Staff.js
├── controllers/                 # Business logic
│   ├── adminController.js
│   ├── bookingController.js
│   ├── contactController.js
│   ├── serviceController.js
│   └── staffController.js
├── routes/                      # API route definitions
│   ├── adminRoutes.js
│   ├── bookingRoutes.js
│   ├── contactRoutes.js
│   ├── serviceRoutes.js
│   └── staffRoutes.js
├── middleware/
│   └── auth.js                 # JWT authentication middleware
└── utils/
    └── createAdmin.js          # Script to create admin user
```

### Server Setup (`server.js`)
- Port: `5000` (default) or `process.env.PORT`
- Base URL: `/api` prefix for all routes
- Middleware: CORS, JSON parser, URL encoded parser
- Health check: `GET /` returns API status

### Route Organization
All routes are prefixed with `/api`:
- `/api/book-service` - Public booking creation
- `/api/contact` - Public contact form
- `/api/services` - Public services list
- `/api/admin/*` - Admin routes (protected)
- `/api/admin/staff/*` - Staff management (protected)
- `/api/admin/bookings` - Admin bookings view (protected)
- `/api/admin/contacts` - Admin contacts view (protected)

---

## 💾 Database & Models

### Database
- **Type:** MongoDB (NoSQL)
- **Connection:** Mongoose ODM
- **Connection String:** `process.env.MONGO_URI` or `process.env.MONGODB_URI`

### Collections (Models)

#### 1. **Admin** (`models/Admin.js`)
**Collection:** `admins`

**Schema:**
```javascript
{
  email: String (required, unique, lowercase, trimmed)
  password: String (required, minlength: 6, hashed with bcrypt)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Features:**
- Password automatically hashed before save (pre-save hook)
- `matchPassword(enteredPassword)` method for password comparison
- Email normalized to lowercase

**Usage:**
- Admin authentication
- JWT token generation
- Admin profile management

---

#### 2. **Booking** (`models/Booking.js`)
**Collection:** `bookings`

**Schema:**
```javascript
{
  name: String (required, trimmed)
  phone: String (required, trimmed)
  email: String (optional, lowercase, trimmed)
  city: String (optional, trimmed)
  address: String (required, trimmed)
  serviceType: String (required, trimmed)
  preferredDate: String (optional, trimmed)
  preferredTime: String (optional, trimmed)
  status: String (enum: ['pending', 'assigned', 'completed', 'cancelled'], default: 'pending')
  assignedStaff: ObjectId (ref: 'Staff', default: null)
  paymentMethod: String (optional, trimmed)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Relationships:**
- `assignedStaff` → References `Staff` model (populated in queries)

**Status Flow:**
- `pending` → `assigned` → `completed` or `cancelled`

---

#### 3. **Contact** (`models/Contact.js`)
**Collection:** `contacts`

**Schema:**
```javascript
{
  name: String (required, trimmed)
  phone: String (optional, trimmed)
  email: String (required, lowercase, trimmed)
  subject: String (optional, trimmed)
  message: String (required, trimmed)
  read: Boolean (default: false)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Usage:**
- Contact form submissions
- Admin can mark as read/unread (field exists but no API endpoint yet)

---

#### 4. **Staff** (`models/Staff.js`)
**Collection:** `staff`

**Schema:**
```javascript
{
  name: String (required, trimmed)
  phone: String (required, trimmed)
  email: String (optional, lowercase, trimmed)
  location: String (required, trimmed)
  skills: [String] (default: [])
  active: Boolean (default: true)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Usage:**
- Staff member management
- Assigned to bookings
- Skills tracking
- Active/inactive status

---

### Static Data (Not in Database)

#### Services (`controllers/serviceController.js`)
Services are **hardcoded** in the controller, not stored in database:

**AMC Services:**
1. PC/Laptop AMC - Starting from ₹399/month
2. Network AMC - Starting from ₹699/month
3. Printer AMC - Starting from ₹499/month

**Home IT Services:**
1. Installation - Starting from ₹399
2. Troubleshooting - Starting from ₹399
3. Repair - Starting from ₹599
4. Upgrade - Starting from ₹799

**Note:** Services are static. To make them dynamic, you'd need to:
- Create a `Service` model
- Add CRUD endpoints
- Update admin panel to manage services

---

## 🎛️ Admin Panel

### Technology
- **Framework:** React 19.2.0
- **Build Tool:** Vite 7.2.4
- **Styling:** Tailwind CSS 3.4.14
- **Routing:** React Router DOM 7.9.6
- **HTTP Client:** Axios 1.13.2
- **Charts:** Recharts 3.4.1
- **State Management:** React Context API

### Folder Structure
```
admin-frontend/
├── src/
│   ├── main.jsx                 # React entry point
│   ├── App.jsx                  # Router setup
│   ├── index.css                # Tailwind imports + global styles
│   ├── admin/
│   │   ├── pages/               # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Bookings.jsx
│   │   │   ├── Contacts.jsx
│   │   │   ├── Staff.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── Payments.jsx
│   │   │   └── NotFound.jsx
│   │   ├── components/          # Reusable components
│   │   │   ├── AdminLayout.jsx  # Main layout wrapper
│   │   │   ├── Sidebar.jsx       # Navigation sidebar
│   │   │   ├── Header.jsx        # Top header with admin info
│   │   │   ├── ProtectedRoute.jsx # Route protection wrapper
│   │   │   ├── LoadingOverlay.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── StatCards.jsx
│   │   │   └── EmptyState.jsx
│   │   └── context/
│   │       └── AuthContext.jsx  # Authentication state
│   └── utils/
│       └── adminApi.js          # Axios instance + API functions
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── index.html
```

### Pages Overview

#### 1. **Login** (`/admin/login`)
- Email/password form
- Calls `POST /api/admin/login`
- Stores JWT token in `localStorage` as `admin_token`
- Redirects to `/admin` on success

#### 2. **Dashboard** (`/admin`)
- Overview statistics (bookings count, contacts count, staff count)
- Charts (booking status distribution)
- Recent bookings list
- Recent contacts list

#### 3. **Bookings** (`/admin/bookings`)
- Table view of all bookings
- Search by name, email, phone
- Filter by status (pending, assigned, completed, cancelled)
- Pagination (8 items per page)
- Actions:
  - Update status (dropdown)
  - Assign staff (modal with staff selection)

#### 4. **Contacts** (`/admin/contacts`)
- Table view of all contact messages
- Search by name, email, subject
- Pagination (8 items per page)
- Shows read/unread status (visual only, no toggle yet)

#### 5. **Staff** (`/admin/staff`)
- Table view of all staff
- Search by name, phone, location
- Pagination (8 items per page)
- CRUD Operations:
  - **Create:** Modal form (name, phone, email, location, skills, active)
  - **Edit:** Modal form (pre-filled)
  - **Delete:** Confirmation before delete

#### 6. **Services** (`/admin/services`)
- Displays static services from API
- Read-only view (no CRUD)
- Shows AMC and Home IT services

#### 7. **Payments** (`/admin/payments`)
- Derived from bookings (extracts paymentMethod from bookings)
- Shows payment method statistics
- Lists bookings with payment info
- **Note:** No separate payment model, data comes from bookings

#### 8. **NotFound** (`*`)
- 404 page for invalid routes

### Authentication Flow

**AuthContext** (`src/admin/context/AuthContext.jsx`):
- Manages authentication state
- Provides `login()`, `logout()`, `admin`, `token`, `loading`, `error`
- Auto-fetches profile on mount if token exists
- Logs out on token expiration

**ProtectedRoute** (`src/admin/components/ProtectedRoute.jsx`):
- Wraps protected routes
- Redirects to `/admin/login` if not authenticated
- Shows loading state while checking auth

**API Client** (`src/utils/adminApi.js`):
- Axios instance with base URL: `http://localhost:5000/api` (or env var)
- Request interceptor: Adds `Authorization: Bearer <token>` header
- Response interceptor: Handles 401 errors (clears token, redirects to login)
- All API functions wrapped with error handling

### Data Fetching Pattern
```javascript
// Example: Fetching bookings
const [bookings, setBookings] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchBookings(); // From adminApi.js
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);
```

---

## 📡 API Endpoints Reference

### Base URL
- Development: `http://localhost:5000/api`
- Production: Set via `VITE_API_BASE_URL` in admin frontend `.env`

### Public Endpoints (No Authentication)

#### 1. Health Check
```
GET /
Response: { success: true, message: "TechCare Pro360 API is running", version: "1.0.0" }
```

#### 2. Create Booking
```
POST /api/book-service
Body: {
  name: string (required)
  phone: string (required)
  email: string (optional)
  city: string (optional)
  address: string (required)
  serviceType: string (required)
  preferredDate: string (optional)
  preferredTime: string (optional)
  paymentMethod: string (optional)
}
Response: { success: true, message: "...", data: booking }
```

#### 3. Create Contact
```
POST /api/contact
Body: {
  name: string (required)
  phone: string (optional)
  email: string (required)
  subject: string (optional)
  message: string (required)
}
Response: { success: true, message: "...", data: contact }
```

#### 4. Get Services
```
GET /api/services
Response: {
  success: true,
  data: {
    amc: [...],
    homeIT: [...]
  }
}
```

---

### Admin Endpoints (Authentication Required)

**All admin endpoints require:**
```
Header: Authorization: Bearer <JWT_TOKEN>
```

#### 1. Admin Login
```
POST /api/admin/login
Body: {
  email: string
  password: string
}
Response: {
  success: true,
  data: {
    token: "jwt-token-string",
    admin: { id: "...", email: "..." }
  }
}
```

#### 2. Get Admin Profile
```
GET /api/admin/profile
Response: { success: true, data: admin }
```

#### 3. Get All Bookings
```
GET /api/admin/bookings
Response: { success: true, data: [bookings] }
Note: Populates assignedStaff field
```

#### 4. Update Booking Status
```
PUT /api/admin/update-status/:bookingId
Body: { status: "pending" | "assigned" | "completed" | "cancelled" }
Response: { success: true, data: booking }
```

#### 5. Assign Staff to Booking
```
PUT /api/admin/assign-staff/:bookingId
Body: { staffId: "staff-object-id" }
Response: { success: true, data: booking }
Note: Automatically sets status to "assigned"
```

#### 6. Get All Contacts
```
GET /api/admin/contacts
Response: { success: true, data: [contacts] }
```

#### 7. Staff Management

**Get All Staff:**
```
GET /api/admin/staff
Response: { success: true, data: [staff] }
```

**Create Staff:**
```
POST /api/admin/staff
Body: {
  name: string (required)
  phone: string (required)
  email: string (optional)
  location: string (required)
  skills: [string] (optional)
  active: boolean (optional, default: true)
}
Response: { success: true, data: staff }
```

**Get Staff by ID:**
```
GET /api/admin/staff/:id
Response: { success: true, data: staff }
```

**Update Staff:**
```
PUT /api/admin/staff/:id
Body: { ...any staff fields }
Response: { success: true, data: staff }
```

**Delete Staff:**
```
DELETE /api/admin/staff/:id
Response: { success: true, message: "..." }
```

---

## 🔐 Authentication & Authorization

### JWT Authentication

**Token Generation:**
- Generated on admin login
- Contains: `{ id: admin._id }`
- Expires in: 30 days
- Secret: `process.env.JWT_SECRET` (must be set)

**Token Storage:**
- Frontend: `localStorage.getItem('admin_token')`
- Sent in header: `Authorization: Bearer <token>`

**Middleware** (`middleware/auth.js`):
- Extracts token from `Authorization` header
- Verifies token with JWT_SECRET
- Finds admin by ID from token
- Attaches `req.admin` to request
- Returns 401 if token invalid/missing

**Protected Routes:**
- All `/api/admin/*` routes use `protect` middleware
- Exception: `/api/admin/login` is public

**Frontend Protection:**
- `ProtectedRoute` component checks for token
- Redirects to `/admin/login` if not authenticated
- Auto-redirects on 401 responses

---

## 📅 Bookings & Payments Flow

### Booking Creation Flow

1. **User fills form** on `booking.html`
2. **JavaScript** (`main.js`) collects form data
3. **POST** to `/api/book-service` with:
   - Customer info (name, phone, email, city, address)
   - Service details (serviceType, preferredDate, preferredTime)
   - Payment method (Cash on Delivery, Online, etc.)
4. **Backend** creates booking with:
   - Status: `pending`
   - assignedStaff: `null`
5. **Response** returns booking with `_id`
6. **Frontend** shows success alert with booking ID

### Payment Handling

**Current Implementation:**
- Payment method is stored as a string in booking (`paymentMethod` field)
- No actual payment processing
- Payment methods: "Cash on Delivery", "Online Payment", etc. (from form)
- No payment gateway integration
- No payment status tracking

**Payment Data:**
- Stored in `Booking.paymentMethod` (string)
- Displayed in admin panel "Payments" page
- Derived from bookings, not a separate model

### Booking Status Flow

```
pending → assigned → completed
         ↓
      cancelled
```

**Status Updates:**
- Admin can change status via dropdown in admin panel
- Assigning staff automatically sets status to `assigned`
- Status stored in `Booking.status` field

### Staff Assignment

1. Admin selects booking
2. Clicks "Assign Staff"
3. Modal shows list of active staff
4. Admin selects staff member
5. **PUT** `/api/admin/assign-staff/:bookingId` with `staffId`
6. Backend updates:
   - `assignedStaff` = selected staff ID
   - `status` = `assigned`
7. Booking now shows assigned staff in admin panel

---

## ⚙️ Environment Configuration

### Backend `.env` (Root Directory)

**Required:**
```env
MONGO_URI=mongodb://localhost:27017/techcare-pro360
# OR
MONGODB_URI=mongodb://localhost:27017/techcare-pro360

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Optional:**
```env
PORT=5000
NODE_ENV=development

# Admin creation (defaults used if not set)
ADMIN_EMAIL=admin@techcare.com
ADMIN_PASSWORD=admin123
```

### Frontend `.env` (admin-frontend directory)

**Optional:**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Note:** If not set, defaults to `http://localhost:5000/api`

### Ports

- **Backend:** `5000` (default)
- **Admin Frontend (Dev):** `5173` (Vite default)
- **Public Frontend:** Served via file system or web server (no specific port)

---

## 📁 Complete File Structure

```
Project structure/
├── 📄 index.html                    # Homepage
├── 📄 about.html                    # About page
├── 📄 services.html                 # Services page
├── 📄 booking.html                   # Booking form
├── 📄 contact.html                  # Contact form
├── 📄 testimonials.html             # Testimonials
├── 📄 faq.html                       # FAQ
├── 📄 blog.html                      # Blog
│
├── 📦 package.json                   # Backend dependencies
├── 📦 server.js                      # Express server entry point
│
├── 📁 assets/                        # Public frontend assets
│   ├── 📁 css/
│   │   └── style.css
│   ├── 📁 js/
│   │   └── main.js                  # All frontend JavaScript
│   └── 📁 img/                       # Images
│
├── 📁 config/
│   └── db.js                        # MongoDB connection
│
├── 📁 models/                        # Mongoose schemas
│   ├── Admin.js
│   ├── Booking.js
│   ├── Contact.js
│   └── Staff.js
│
├── 📁 controllers/                   # Business logic
│   ├── adminController.js
│   ├── bookingController.js
│   ├── contactController.js
│   ├── serviceController.js
│   └── staffController.js
│
├── 📁 routes/                        # API routes
│   ├── adminRoutes.js
│   ├── bookingRoutes.js
│   ├── contactRoutes.js
│   ├── serviceRoutes.js
│   └── staffRoutes.js
│
├── 📁 middleware/
│   └── auth.js                      # JWT authentication
│
├── 📁 utils/
│   └── createAdmin.js               # Admin creation script
│
├── 📁 scripts/
│   └── test-mongo.js                # MongoDB test script
│
└── 📁 admin-frontend/                # React admin panel
    ├── 📦 package.json
    ├── 📄 vite.config.js
    ├── 📄 tailwind.config.js
    ├── 📄 postcss.config.js
    ├── 📄 index.html
    │
    └── 📁 src/
        ├── 📄 main.jsx              # React entry
        ├── 📄 App.jsx               # Router
        ├── 📄 index.css             # Tailwind + styles
        │
        ├── 📁 admin/
        │   ├── 📁 pages/            # Page components
        │   │   ├── Login.jsx
        │   │   ├── Dashboard.jsx
        │   │   ├── Bookings.jsx
        │   │   ├── Contacts.jsx
        │   │   ├── Staff.jsx
        │   │   ├── Services.jsx
        │   │   ├── Payments.jsx
        │   │   └── NotFound.jsx
        │   │
        │   ├── 📁 components/        # Reusable components
        │   │   ├── AdminLayout.jsx
        │   │   ├── Sidebar.jsx
        │   │   ├── Header.jsx
        │   │   ├── ProtectedRoute.jsx
        │   │   ├── LoadingOverlay.jsx
        │   │   ├── Modal.jsx
        │   │   ├── Pagination.jsx
        │   │   ├── SearchBar.jsx
        │   │   ├── StatusBadge.jsx
        │   │   ├── StatCards.jsx
        │   │   └── EmptyState.jsx
        │   │
        │   └── 📁 context/
        │       └── AuthContext.jsx   # Auth state management
        │
        └── 📁 utils/
            └── adminApi.js           # API client
```

---

## ⚠️ Current Limitations & Issues

### 1. **Static Services**
- Services are hardcoded in `serviceController.js`
- No database model for services
- No CRUD operations for services
- Admin panel can only view, not edit services

**To Fix:** Create `Service` model and add CRUD endpoints

---

### 2. **Payment Processing**
- No actual payment gateway integration
- Payment method stored as string only
- No payment status tracking
- No payment history
- No refund handling

**To Fix:** Integrate payment gateway (Razorpay, Stripe, etc.) and create Payment model

---

### 3. **Contact Read/Unread**
- `read` field exists in Contact model
- No API endpoint to toggle read status
- Admin panel shows read status but can't change it

**To Fix:** Add `PUT /api/admin/contacts/:id` endpoint to update read status

---

### 4. **Hardcoded API URLs**
- Public frontend (`main.js`) has hardcoded `http://localhost:5000/api`
- Won't work in production without changing code

**To Fix:** Use environment variable or config file

---

### 5. **No User Accounts**
- No customer/user registration
- No login for customers
- Bookings are anonymous (no user association)

**To Fix:** Create User model and authentication for customers

---

### 6. **No Email Notifications**
- No email sent on booking creation
- No email sent on status updates
- No email sent on contact form submission

**To Fix:** Integrate email service (Nodemailer, SendGrid, etc.)

---

### 7. **No Real-time Updates**
- Admin panel requires manual refresh
- No WebSocket or polling for live updates
- No notifications for new bookings/contacts

**To Fix:** Add WebSocket (Socket.io) or polling mechanism

---

### 8. **No File Uploads**
- No image upload for staff
- No document upload for bookings
- No profile pictures

**To Fix:** Add file upload middleware (Multer) and storage

---

### 9. **Limited Search/Filtering**
- Basic search only (name, email, phone)
- No advanced filters (date range, status combinations)
- No sorting options

**To Fix:** Enhance search with query parameters and filters

---

### 10. **No Analytics/Dashboard**
- Basic stats only (counts)
- No revenue tracking
- No booking trends
- No staff performance metrics

**To Fix:** Add analytics endpoints and enhanced dashboard

---

### 11. **No Pagination on Backend**
- Frontend does client-side pagination
- All data loaded at once
- Not scalable for large datasets

**To Fix:** Add pagination to backend endpoints (limit, skip, page)

---

### 12. **No Input Validation**
- Basic validation only
- No email format validation
- No phone number validation
- No date validation

**To Fix:** Add validation middleware (express-validator, Joi)

---

### 13. **No Error Logging**
- Errors only logged to console
- No error tracking service
- No error reporting

**To Fix:** Integrate error tracking (Sentry, LogRocket, etc.)

---

### 14. **No Rate Limiting**
- No protection against spam
- No rate limiting on API endpoints
- Vulnerable to DDoS

**To Fix:** Add rate limiting middleware (express-rate-limit)

---

### 15. **CORS Configuration**
- CORS allows all origins (`app.use(cors())`)
- Not secure for production

**To Fix:** Configure CORS to allow specific origins only

---

## 🚀 Quick Start Guide

### 1. Setup Backend
```bash
# Install dependencies
npm install

# Create .env file
MONGO_URI=mongodb://localhost:27017/techcare-pro360
JWT_SECRET=your-secret-key-here
PORT=5000

# Create admin user
npm run create-admin

# Start server
npm start
# or for development
npm run dev
```

### 2. Setup Admin Frontend
```bash
cd admin-frontend

# Install dependencies
npm install

# Create .env file (optional)
VITE_API_BASE_URL=http://localhost:5000/api

# Start dev server
npm run dev
```

### 3. Access Points
- **Public Website:** Open HTML files in browser or serve via web server
- **Admin Panel:** `http://localhost:5173/admin/login`
- **Backend API:** `http://localhost:5000`

---

## 📝 Summary

### What Works
✅ Public website with booking and contact forms  
✅ Backend API with MongoDB  
✅ Admin panel with full CRUD for bookings, contacts, staff  
✅ JWT authentication  
✅ Booking status management  
✅ Staff assignment to bookings  

### What's Static
⚠️ Services (hardcoded)  
⚠️ Payment methods (string only)  
⚠️ No payment processing  

### What's Missing
❌ User accounts/customer login  
❌ Email notifications  
❌ Real-time updates  
❌ File uploads  
❌ Advanced analytics  
❌ Payment gateway integration  

---

**This document provides a complete overview of your project. Use it as a reference for planning new features or making changes.**

