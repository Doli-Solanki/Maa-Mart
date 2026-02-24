# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Full-stack grocery store application (Maa-Mart) with user authentication, product management, shopping cart, order placement, and admin panel.

**Stack:**
- Backend: Node.js + Express + Sequelize + MySQL
- Frontend: React 18 + TypeScript + Vite + TailwindCSS + Radix UI
- Auth: JWT-based authentication with role-based access control
- Language: Backend uses JavaScript (ES Modules), Frontend uses TypeScript

## Development Commands

### Backend (Node.js + Express)

```powershell
# Install dependencies
cd backend
npm install

# Development server with auto-reload
npm run dev

# Production server
npm start

# Create admin user (interactive or with args)
npm run create-admin
npm run create-admin admin@example.com adminpassword123 "Admin Name"
```

**Backend runs on:** `http://localhost:5000`

### Frontend (React + Vite)

```powershell
# Install dependencies
cd frontend
npm install

# Development server
npm run dev

# Type-check
tsc -b

# Lint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

**Frontend runs on:** `http://localhost:5173`

### Database Setup

The application requires MySQL. Database schema is automatically synced via Sequelize on server start (development mode only).

**Note:** In production, `alter: false` is enforced - use proper migrations instead of auto-sync.

## Essential Configuration

### Backend Environment Variables (.env)

**Required variables** - server will fail to start if missing:
- `JWT_SECRET` - Must be set, no fallback exists (security hardening applied)
- `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST` - All required for database connection

**Optional variables:**
- `PORT` (default: 5000)
- `NODE_ENV` (default: development)
- `FRONTEND_URL` (default: http://localhost:5173 in dev)

**Generate JWT_SECRET:**
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use `backend/.env.example` as template.

## Architecture & Key Patterns

### Backend Architecture

**Models & Associations (Sequelize ORM):**
- All models defined in `backend/models/`
- `backend/models/index.js` centralizes associations:
  - Product → Category (belongsTo)
  - Category → Products (hasMany)
  - Order → User (belongsTo)
  - User → Orders (hasMany)
- Always import models from `models/index.js` to ensure associations are loaded

**Authentication & Authorization:**
- JWT tokens issued on login, stored in frontend localStorage
- `authMiddleware.js` provides:
  - `authenticate` - Validates JWT, attaches `req.user`
  - `isAdmin` - Checks `req.user.role === 'admin'`
- User roles: `'user'` (default) or `'admin'`
- **Security note:** userId is always taken from `req.user.id` (token), never from request body

**Route Structure:**
- `authRoutes.js` - Login, register (rate-limited: 5 req/15min)
- `productRoutes.js` - Product CRUD, seeding
- `orderRoutes.js` - All routes require authentication
- `categoryRoutes.js` - Category management
- `adminRoutes.js` - Admin-only routes (dashboard stats, user/order/product management)

**Security Features Applied:**
- Helmet for security headers
- Rate limiting (auth: 5/15min, general API: 100/15min)
- Input validation in all controllers
- CORS configured with environment-based origin
- No hardcoded secrets (fails fast if missing)
- Global error handler that sanitizes errors in production

### Frontend Architecture

**State Management:**
- React Context API for global state
- `AuthContext.tsx` - User authentication state, login/logout/register
- `CartContext.tsx` - Shopping cart state, add/remove items
- `WishlistContext.tsx` - Wishlist functionality

**Routing (React Router v7):**
- `/` - Home (hero, categories, products)
- `/login`, `/signup` - Authentication
- `/cart` - Shopping cart
- `/wishlist` - User wishlist
- `/profile` - User profile
- `/admin` - Admin dashboard (role-protected)

**Component Structure:**
- `src/components/` - Shared components (Header, Footer, ProductGrid, etc.)
- `src/components/ui/` - Radix UI components with Tailwind styling
- `src/components/admin/` - Admin-specific components
- `src/pages/` - Page-level components

**API Integration:**
- All API calls use `/api/*` paths (proxied by Vite in dev)
- JWT token sent in `Authorization: Bearer <token>` header
- Error handling with toast notifications (Sonner)

## Testing & Validation

**Before making changes, verify:**
1. Server starts successfully: `cd backend && npm run dev`
2. No missing environment variables
3. Database connection succeeds

**After code changes:**
1. Backend: Restart dev server if models/middleware/routes changed
2. Frontend: Check for TypeScript errors: `tsc -b`
3. Frontend: Run linter: `npm run lint`
4. Test authentication flows if auth-related changes made
5. Test admin panel access if RBAC changes made

**Comprehensive testing guide available:** `TESTING_GUIDE.md`

## Common Development Patterns

### Adding a New Backend Route

1. Create controller in `backend/controllers/`
2. Add route in appropriate file in `backend/routes/`
3. Apply middleware: `authenticate`, `isAdmin` as needed
4. Add input validation in controller
5. Return standardized JSON responses with proper status codes

### Adding a New Model

1. Create model in `backend/models/`
2. Add associations in `backend/models/index.js`
3. Export from index.js
4. Restart server to sync schema (dev mode)

### Adding a Frontend Page

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Use existing contexts for auth/cart/wishlist state
4. Add to Header navigation if needed

### Input Validation Pattern (Backend)

Always validate in controllers:
```javascript
if (!field || typeof field !== 'expectedType') {
  return res.status(400).json({ message: 'Descriptive error message' });
}
```

## Admin Panel

**Access:** Users with `role === 'admin'` can access `/admin`

**Default admin credentials (if using create-admin script):**
- Email: `admin@example.com`
- Password: `admin123`

**Admin capabilities:**
- View dashboard stats (users, products, orders, revenue)
- Manage products (CRUD operations)
- View all users
- View all orders and update order status
- Upload product images (stored in `backend/uploads/`)

**Creating first admin:**
```powershell
cd backend
npm run create-admin
```

## Important Security Considerations

- Never commit `.env` files
- JWT_SECRET must be strong and random in production
- In production, set `NODE_ENV=production` to:
  - Disable detailed error messages
  - Disable database schema auto-sync
  - Use 'combined' log format instead of 'dev'
- Rate limiting is IP-based (consider Redis for distributed systems)
- Order placement security: userId always from JWT token, not request body
- Order visibility: Users see only their orders, admins see all

## Known Technical Constraints

- **No TypeScript in Backend:** Backend is JavaScript with ES Modules
- **Image Upload:** Stored locally in `backend/uploads/` (not cloud storage)
- **No Pagination:** Products/orders/users load all records (performance limitation)
- **No Database Migrations:** Schema synced via Sequelize in dev only
- **Test Mode Payments:** Razorpay integration is placeholder, Cash on Delivery is primary
- **No Email Verification:** User accounts active immediately on registration

## Recent Code Review Fixes Applied

The codebase has undergone security hardening and bug fixes:
- Removed JWT secret fallbacks (now fails fast)
- Added comprehensive input validation
- Fixed authorization bypass in order placement
- Added rate limiting and security headers
- Standardized error handling
- Added environment variable validation

See `CODE_REVIEW_SUMMARY.md` and `FIXES_APPLIED.md` for details.

## Troubleshooting

**Server won't start:**
- Check all required env vars are set in `backend/.env`
- Verify MySQL is running and credentials are correct
- Ensure no other process is using port 5000

**CORS errors:**
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- Default dev: `http://localhost:5173`

**Authentication issues:**
- Check JWT token is being sent in Authorization header
- Verify token hasn't expired (check expiry in userController.js)
- Ensure user role is correct in database for admin access

**Database errors:**
- Check MySQL connection and credentials
- Verify database exists (create manually if needed)
- In production, ensure migrations are run (don't rely on auto-sync)

See `TROUBLESHOOTING.md` and `TROUBLESHOOTING_500_ERROR.md` for more details.
