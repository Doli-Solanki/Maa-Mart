# Troubleshooting 500 Error on All APIs

If all APIs are returning 500 errors, follow these steps:

## Step 1: Check Dependencies

Make sure all new dependencies are installed:

```bash
cd backend
npm install
```

This should install:
- helmet
- morgan
- express-rate-limit

## Step 2: Check Environment Variables

Make sure your `.env` file exists and has all required variables:

```bash
# Check if .env exists
cd backend
ls .env

# If it doesn't exist, create it from the template
cp env.example.txt .env
```

Required variables:
- `DB_HOST`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`
- `JWT_SECRET` (CRITICAL - server won't start without this)

## Step 3: Check Server Logs

Start the server and check for errors:

```bash
cd backend
npm run dev
```

Look for:
- Database connection errors
- Missing environment variable errors
- Module import errors

## Step 4: Test Health Endpoint

Try the health check endpoint first (doesn't require database):

```bash
curl http://localhost:5000/health
```

If this works, the server is running but there might be a database issue.

## Step 5: Check Database Connection

Verify your database is running and accessible:

```bash
# Test MySQL connection (adjust credentials)
mysql -h localhost -u root -p
```

## Step 6: Common Issues

### Issue: "JWT_SECRET not set"
**Solution:** Add JWT_SECRET to your .env file:
```env
JWT_SECRET=your_secret_here
```

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Issue: "Database connection error"
**Solution:** 
- Check MySQL is running
- Verify credentials in .env
- Ensure database exists

### Issue: "Cannot find module 'helmet'"
**Solution:** 
```bash
cd backend
npm install
```

### Issue: Rate limiting causing issues
**Solution:** The rate limiter might be too strict. You can temporarily disable it by commenting out these lines in `server.js`:
```javascript
// app.use('/api/auth', authLimiter);
// app.use('/api/', generalLimiter);
```

## Step 7: Check Console Output

When you make an API request, check the server console for:
- Error messages
- Stack traces
- Database query errors

The error handler now logs all errors to the console, so you should see the actual error message.

## Step 8: Test Individual Endpoints

Test endpoints one by one:

1. **Health check (no auth, no DB):**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Root endpoint:**
   ```bash
   curl http://localhost:5000/
   ```

3. **Products (no auth):**
   ```bash
   curl http://localhost:5000/api/products
   ```

4. **Categories (no auth):**
   ```bash
   curl http://localhost:5000/api/categories
   ```

5. **Auth endpoints:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@test.com","password":"123456"}'
   ```

## Step 9: Check Error Response

The error response should now include more details in development mode. Check the response body:

```json
{
  "message": "Internal server error",
  "stack": "..."
}
```

The stack trace will show you exactly where the error is occurring.

## Step 10: Verify Fixes Applied

Make sure all the fixes are in place:

1. Check `backend/server.js` has error handling middleware
2. Check `backend/middleware/authMiddleware.js` validates JWT_SECRET
3. Check `backend/config/db.js` validates DB environment variables
4. Check all controllers have proper error handling

## Still Having Issues?

If you're still getting 500 errors:

1. **Check the actual error in console** - The server should log the error
2. **Try disabling rate limiting temporarily** - Comment out rate limiter lines
3. **Try disabling helmet temporarily** - Comment out `app.use(helmet())`
4. **Check database models** - Make sure all models are properly defined
5. **Verify route handlers** - Make sure all routes are properly exported

## Quick Fix: Minimal Server

If nothing works, try creating a minimal test server:

```javascript
// test-server.js
import express from 'express';
const app = express();

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

app.listen(5000, () => {
  console.log('Test server running on port 5000');
});
```

Run it:
```bash
node test-server.js
```

If this works, the issue is with your main server configuration.

