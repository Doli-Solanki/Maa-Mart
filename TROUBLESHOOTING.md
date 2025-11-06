# Troubleshooting Admin Panel Issues

## Page Not Loading - Common Issues and Solutions

### 1. Check if Backend Server is Running

Make sure the backend server is running:
```bash
cd backend
npm run dev
```

The server should be running on `http://localhost:5000` (or the port specified in your `.env` file).

### 2. Check if You're Logged In as Admin

1. Go to `/login` and login with admin credentials
2. Verify your user has `role: 'admin'` in the database
3. Check browser console for authentication errors

To create an admin user:
```bash
cd backend
npm run create-admin
```

### 3. Check Browser Console

Open browser DevTools (F12) and check:
- **Console tab**: Look for JavaScript errors
- **Network tab**: Check if API requests are failing
  - Look for requests to `/api/admin/*`
  - Check the status code (should be 200, not 401 or 403)
  - Check if the Authorization header is being sent

### 4. Verify JWT Token

Check if token is stored:
```javascript
// In browser console
localStorage.getItem('auth_token_v1')
```

If token is missing:
1. Logout and login again
2. Check if login API is returning a token

### 5. Check CORS Issues

If you see CORS errors in console:
- Make sure backend has CORS enabled (should be in `server.js`)
- Check that frontend is making requests to the correct backend URL

### 6. Database Connection

Check if database is connected:
- Look at backend console for database connection messages
- Verify `.env` file has correct database credentials

### 7. Common Error Messages

**"No token provided" (401)**
- You're not logged in
- Token was not saved after login
- Solution: Logout and login again

**"Admin access required" (403)**
- Your user doesn't have admin role
- Solution: Update user role in database or create admin user

**"Failed to load dashboard statistics"**
- Backend server might not be running
- Database connection issue
- Check backend console for errors

**"Network Error" or "Failed to fetch"**
- Backend server is not running
- Wrong API URL
- CORS issue

### 8. Quick Debug Steps

1. **Check Backend Logs**: Look at the terminal where backend is running
2. **Check Network Tab**: In browser DevTools, see what requests are being made
3. **Check Console**: Look for JavaScript errors
4. **Verify Admin Role**: 
   ```sql
   SELECT id, email, role FROM users WHERE email = 'your-email@example.com';
   ```

### 9. Reset and Try Again

If nothing works:
1. Stop both frontend and backend servers
2. Clear browser localStorage:
   ```javascript
   localStorage.clear();
   ```
3. Restart backend: `cd backend && npm run dev`
4. Restart frontend: `cd frontend && npm run dev`
5. Create admin user: `cd backend && npm run create-admin`
6. Login with admin credentials
7. Navigate to `/admin`

### 10. Check File Structure

Make sure these files exist:
- `backend/middleware/authMiddleware.js`
- `backend/routes/adminRoutes.js`
- `backend/controllers/adminController.js`
- `frontend/src/pages/AdminDashboard.tsx`
- `frontend/src/components/admin/ProductManagement.tsx`
- `frontend/src/components/admin/UserManagement.tsx`
- `frontend/src/components/admin/OrderManagement.tsx`

