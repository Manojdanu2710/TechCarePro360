# Admin Panel Authentication - Testing Guide

## Prerequisites

1. **Backend must be running** on `http://localhost:5000`
2. **MongoDB must be connected** and running
3. **Environment variables** must be set (see below)

## Step 1: Set Environment Variables

### Backend `.env` file (root directory):
```env
# Database
MONGODB_URI=mongodb://localhost:27017/techcare-pro360

# JWT Secret (REQUIRED for authentication)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional: Admin credentials (defaults used if not set)
ADMIN_EMAIL=admin@techcare.com
ADMIN_PASSWORD=admin123

# Server Port
PORT=5000
```

### Frontend `.env` file (admin-frontend directory):
```env
# API Base URL (optional - defaults to http://localhost:5000/api)
VITE_API_BASE_URL=http://localhost:5000/api
```

## Step 2: Create Admin Account

### Option A: Using the createAdmin script (Recommended)

1. **Navigate to project root:**
   ```bash
   cd "E:\Project structure"
   ```

2. **Run the createAdmin script:**
   ```bash
   npm run create-admin
   ```

3. **Expected output:**
   ```
   Creating admin with email: admin@techcare.com
   
   ✅ Admin created successfully!
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Email: admin@techcare.com
   Password: admin123
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   ⚠️  Please change the default password after first login!
   ⚠️  Make sure JWT_SECRET is set in your .env file!
   ```

### Option B: Using MongoDB directly

If the script doesn't work, you can create an admin manually:

```javascript
// In MongoDB shell or Compass
use techcare-pro360

// The password will be automatically hashed by the Admin model
db.admins.insertOne({
  email: "admin@techcare.com",
  password: "admin123"  // Will be hashed automatically
})
```

## Step 3: Verify Admin Creation

### Check MongoDB:
```bash
# Using MongoDB shell
mongo
use techcare-pro360
db.admins.find().pretty()
```

You should see:
- Email: `admin@techcare.com` (lowercase)
- Password: A hashed string starting with `$2a$10$...`
- `createdAt` and `updatedAt` timestamps

## Step 4: Start Backend Server

```bash
# In project root
npm start
# or for development
npm run dev
```

**Verify backend is running:**
- Open browser: `http://localhost:5000`
- Should see: `{"success":true,"message":"TechCare Pro360 API is running"}`

## Step 5: Start Admin Frontend

```bash
# Navigate to admin-frontend
cd admin-frontend

# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
```

**Expected output:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 6: Test Login

1. **Open admin panel:** `http://localhost:5173/admin/login`

2. **Enter credentials:**
   - Email: `admin@techcare.com`
   - Password: `admin123`

3. **Check browser console** (F12 → Console tab):
   - Should see: `[Auth] Attempting login for: admin@techcare.com`
   - Should see: `[Auth] Login response: { token: "...", admin: {...} }`
   - Should see: `[Auth] Token received, storing in localStorage`
   - Should see: `[Auth] Login successful`

4. **Check Network tab** (F12 → Network):
   - Find the `/admin/login` request
   - **Request:** Should show email and password
   - **Response:** Should return `{ success: true, data: { token: "...", admin: {...} } }`
   - **Status:** Should be `200 OK`

5. **Check localStorage** (F12 → Application → Local Storage):
   - Key: `admin_token`
   - Value: Should be a JWT token string

6. **After successful login:**
   - Should redirect to `/admin` (dashboard)
   - Should see admin email in header
   - Should NOT see 401 errors

## Step 7: Test Protected Routes

After login, test these routes:

1. **Dashboard:** `http://localhost:5173/admin`
   - Should load without 401 errors
   - Check console: `[API Request] GET /admin/profile with token`

2. **Bookings:** `http://localhost:5173/admin/bookings`
   - Should load bookings list
   - Check Network tab: `GET /api/admin/bookings` should have `Authorization: Bearer <token>`

3. **Staff:** `http://localhost:5173/admin/staff`
   - Should load staff list
   - Check Network tab: `GET /api/admin/staff` should have `Authorization: Bearer <token>`

4. **Contacts:** `http://localhost:5173/admin/contacts`
   - Should load contact messages
   - Check Network tab: `GET /api/admin/contacts` should have `Authorization: Bearer <token>`

## Troubleshooting

### Issue: "Invalid credentials" error

**Possible causes:**
1. **Admin not created** - Run `npm run create-admin` again
2. **Wrong email/password** - Check what you entered
3. **Email case mismatch** - Try lowercase email
4. **Password not hashed** - Check MongoDB, password should start with `$2a$10$`
5. **Database connection issue** - Check MongoDB is running

**Debug steps:**
```bash
# Check if admin exists
mongo
use techcare-pro360
db.admins.find().pretty()

# Check backend logs for errors
# Look for "Login error:" in console
```

### Issue: 401 errors on protected routes

**Possible causes:**
1. **Token not stored** - Check localStorage for `admin_token`
2. **Token expired** - Login again
3. **JWT_SECRET mismatch** - Ensure same secret in backend `.env`
4. **Authorization header missing** - Check Network tab → Request Headers

**Debug steps:**
1. Open browser console (F12)
2. Check for `[API Request]` logs - should show "with token"
3. Check Network tab → Request Headers → Should see `Authorization: Bearer <token>`
4. Check backend logs for authentication errors

### Issue: "Token not received from server"

**Possible causes:**
1. **Backend response structure changed** - Check Network tab → Response
2. **Backend error** - Check backend console for errors
3. **CORS issue** - Check browser console for CORS errors

**Debug steps:**
1. Check Network tab → `/admin/login` response
2. Should be: `{ success: true, data: { token: "...", admin: {...} } }`
3. Check backend console for errors

### Issue: "JWT_SECRET is not set"

**Solution:**
1. Create/update `.env` file in project root
2. Add: `JWT_SECRET=your-secret-key-here`
3. Restart backend server

### Issue: Backend not responding

**Check:**
1. Backend server is running: `http://localhost:5000`
2. MongoDB is connected (check backend console)
3. Port 5000 is not in use by another application

## Verification Checklist

- [ ] Backend `.env` has `JWT_SECRET` set
- [ ] Admin account created in database
- [ ] Backend server running on port 5000
- [ ] Frontend dev server running
- [ ] Can access login page
- [ ] Login with correct credentials works
- [ ] Token stored in localStorage after login
- [ ] Redirected to dashboard after login
- [ ] Protected routes load without 401 errors
- [ ] Authorization header present in all API requests
- [ ] Admin email shown in header

## Common Mistakes

1. **Forgot to set JWT_SECRET** - Most common issue
2. **Using wrong email case** - Use lowercase
3. **Admin not created** - Must run createAdmin script
4. **Backend not running** - Start with `npm start`
5. **MongoDB not connected** - Check connection string
6. **Wrong port** - Backend on 5000, frontend on 5173

## Next Steps

After successful login:
1. Change default password (if using default)
2. Test all admin panel features
3. Verify CRUD operations work
4. Check error handling on invalid inputs

## Support

If issues persist:
1. Check browser console for errors
2. Check backend console for errors
3. Verify all environment variables are set
4. Check MongoDB connection
5. Review Network tab for failed requests

