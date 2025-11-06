# Testing Guide - After Code Review Fixes

This guide helps you test that all fixes are working correctly.

## Prerequisites

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create .env file:**
   Create `backend/.env` with the following content:
   ```env
   DB_HOST=localhost
   DB_NAME=grocery_store
   DB_USER=root
   DB_PASS=your_password
   JWT_SECRET=your_super_secret_jwt_key_use_a_strong_random_string
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

3. **Generate JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Copy the output and use it as your `JWT_SECRET` in `.env`

## Security Testing

### Test 1: Environment Variable Validation
**Expected:** Server should fail to start if required env vars are missing

```bash
# Remove JWT_SECRET from .env temporarily
# Start server
npm run dev
# Should see: "❌ CRITICAL: JWT_SECRET environment variable is required!"
# Should exit with error code
```

### Test 2: JWT Secret Validation
**Expected:** No hardcoded fallback secret

1. Remove `JWT_SECRET` from `.env`
2. Try to start server
3. **PASS:** Server exits with error
4. **FAIL:** Server starts (means fallback still exists)

### Test 3: Rate Limiting on Auth Endpoints
**Expected:** After 5 failed login attempts, should be rate limited

```bash
# Use curl or Postman
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"wrong@test.com","password":"wrong"}'
done

# 6th request should return: "Too many login attempts, please try again later."
```

### Test 4: Order Authentication
**Expected:** Cannot place order without authentication

```bash
# Try to place order without token
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[],"totalPrice":100}'

# Should return: 401 Unauthorized
```

### Test 5: Authorization Bypass Prevention
**Expected:** Cannot place order for another user

1. Login as User A, get token
2. Try to place order with `userId: <other_user_id>` in body
3. **PASS:** Order is created with User A's ID (from token)
4. **FAIL:** Order is created with userId from request body

### Test 6: Order Visibility
**Expected:** Users can only see their own orders

1. Login as User A, place an order
2. Login as User B, place an order
3. As User B, list orders
4. **PASS:** Only User B's orders are visible
5. **FAIL:** All orders are visible

## Input Validation Testing

### Test 7: Registration Validation
**Expected:** Invalid inputs are rejected

```bash
# Missing fields
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
# Should return: 400 "Name, email, and password are required"

# Invalid email
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"invalid-email","password":"123456"}'
# Should return: 400 "Invalid email format"

# Weak password
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123"}'
# Should return: 400 "Password must be at least 6 characters"
```

### Test 8: Product Validation
**Expected:** Invalid product data is rejected

```bash
# Login as admin first, get token
TOKEN="your_admin_token_here"

# Missing name
curl -X POST http://localhost:5000/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"price":10}'
# Should return: 400 "Product name is required"

# Invalid price
curl -X POST http://localhost:5000/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Product","price":-10}'
# Should return: 400 "Valid price is required"
```

## Error Handling Testing

### Test 9: Global Error Handler
**Expected:** Errors are handled gracefully

1. Make a request to non-existent endpoint
2. **PASS:** Returns 404 with JSON message
3. **FAIL:** Returns HTML error page or crashes

### Test 10: Database Error Handling
**Expected:** Database errors don't expose stack traces

1. Stop MySQL server
2. Try to make API request
3. **PASS:** Returns generic error message
4. **FAIL:** Returns detailed error with stack trace

## Security Headers Testing

### Test 11: Security Headers
**Expected:** Security headers are present

```bash
curl -I http://localhost:5000/health

# Should include headers like:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

## Health Check Testing

### Test 12: Health Endpoint
**Expected:** Health endpoint returns status

```bash
curl http://localhost:5000/health

# Should return:
# {
#   "status": "ok",
#   "timestamp": "...",
#   "uptime": ...
# }
```

## Frontend Testing

### Test 13: Unused Imports
**Expected:** No linter errors

```bash
cd frontend
npm run lint

# Should pass without errors about unused imports
```

## Performance Testing

### Test 14: Rate Limiting on General Endpoints
**Expected:** After 100 requests, should be rate limited

```bash
# Make 101 requests quickly
for i in {1..101}; do
  curl http://localhost:5000/api/products
done

# 101st request should be rate limited
```

## Integration Testing Checklist

- [ ] Server starts with valid .env
- [ ] Server fails to start with missing JWT_SECRET
- [ ] Server fails to start with missing DB credentials
- [ ] Login works with valid credentials
- [ ] Login fails with invalid credentials
- [ ] Registration validates input
- [ ] Order placement requires authentication
- [ ] Users can only see their own orders
- [ ] Admins can see all orders
- [ ] Product creation validates input
- [ ] Rate limiting works on auth endpoints
- [ ] Rate limiting works on general endpoints
- [ ] Health check endpoint works
- [ ] Security headers are present
- [ ] Error handling works correctly
- [ ] CORS is configured correctly

## Manual Testing Steps

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test in Browser:**
   - Open http://localhost:5173
   - Try to register with invalid email (should show error)
   - Register with valid credentials
   - Login
   - Add items to cart
   - Place order (should work)
   - Logout
   - Try to access /admin (should redirect)
   - Login as admin
   - Access /admin (should work)
   - View users, orders, products

## Common Issues

### Issue: "JWT_SECRET not set"
**Solution:** Add JWT_SECRET to your .env file

### Issue: "Database connection error"
**Solution:** 
- Check MySQL is running
- Verify DB credentials in .env
- Ensure database exists

### Issue: "CORS error"
**Solution:** 
- Check FRONTEND_URL in .env matches your frontend URL
- In development, default is http://localhost:5173

### Issue: "Rate limited"
**Solution:** Wait 15 minutes or restart server (in development)

## Performance Recommendations

For production, consider:
- Adding Redis for rate limiting storage
- Implementing database connection pooling
- Adding caching for frequently accessed data
- Implementing pagination for large datasets
- Adding database indexes on foreign keys

