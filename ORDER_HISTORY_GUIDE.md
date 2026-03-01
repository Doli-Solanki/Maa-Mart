# Order History Feature Guide

## Overview

The order history feature allows users to view their past orders with complete details. Admins have a separate order management interface to view and manage ALL orders.

## User Access

### Regular Users (Customers)

**How to Access:**
1. Log in with user credentials
2. Click on your name in the header
3. Select "My Orders" from the dropdown menu
4. View your personal order history

**What Users See:**
- Only their own orders
- Order date, ID, total amount, and status
- Expandable order details showing:
  - Individual items with quantities and prices
  - Delivery address
  - Payment method and status
  - Payment ID (if applicable)
- Orders sorted by date (newest first)
- Empty state message if no orders exist

**Features:**
- ✅ Click any order to expand/collapse details
- ✅ All prices displayed in INR (₹)
- ✅ Color-coded order status badges
- ✅ Responsive design for mobile and desktop

### Admin Users

**How to Access:**
1. Log in with admin credentials
2. Click on your name in the header
3. Select "Admin Panel" from the dropdown menu
4. Navigate to the "Orders" tab

**What Admins See:**
- ALL orders from all users
- Customer information (name, email)
- Order details (items, total, payment method)
- Ability to update order status
- Order statistics in dashboard

**Admin Features:**
- ✅ View all customer orders
- ✅ Update order payment status (pending/completed/failed)
- ✅ See customer details for each order
- ✅ Dashboard statistics (total orders, revenue, etc.)
- ❌ No "My Orders" link (admins use Order Management instead)

## API Endpoints

### User Order History
```
GET /api/orders
Authorization: Bearer <token>
```
Returns orders for the authenticated user only.

### Admin Order Management
```
GET /api/admin/orders
Authorization: Bearer <admin-token>
```
Returns all orders from all users (admin only).

## Login Credentials

### Test Accounts

**Admin Account** (Full access to Admin Panel):
- Email: `admin@example.com`
- Password: `admin123`
- Role: `admin`
- Menu Options: Profile, Admin Panel, Logout

**Regular User Account** (Customer access):
- Email: `user@example.com`
- Password: `user123`
- Role: `user`
- Menu Options: Profile, My Orders, Logout

## Technical Implementation

### Backend
- **Controller**: `backend/controllers/orderController.js`
  - `getUserOrders()` - Filters by authenticated user ID
  - Includes authentication middleware
  - Returns orders sorted by creation date (DESC)

### Frontend
- **Page**: `frontend/src/pages/OrderHistoryPage.tsx`
  - Fetches from `/api/orders` endpoint
  - Displays orders with expand/collapse functionality
  - Handles loading and error states
  - Shows empty state when no orders exist

### Navigation
- **Header**: `frontend/src/components/Header.tsx`
  - Regular users: "My Orders" link
  - Admins: "Admin Panel" link (no "My Orders")
  - Mobile menu includes same options

## Order Status Types

- **pending** - Order created, payment pending
- **confirmed** - Payment confirmed
- **processing** - Order being prepared
- **shipped** - Order dispatched
- **delivered** - Order delivered to customer
- **cancelled** - Order cancelled
- **failed** - Payment or order failed

## Requirements Satisfied

✅ **Requirement 3.1**: Filter orders by authenticated user ID
✅ **Requirement 3.2**: Include order items, status, and timestamps
✅ **Requirement 3.3**: Sort by creation date descending
✅ **Requirement 3.4**: GET /api/orders endpoint implemented
✅ **Requirement 11.1**: Display all user orders
✅ **Requirement 11.2**: Show order date, ID, total, status, items
✅ **Requirement 11.3**: Show detailed info on click
✅ **Requirement 11.4**: Display in reverse chronological order
✅ **Requirement 11.5**: Handle empty state

## Notes

- Users can only see their own orders (security enforced at API level)
- Admins should use the Admin Dashboard for order management
- All prices are displayed in Indian Rupees (₹) with proper formatting
- Order history is automatically updated when new orders are placed
- The feature is fully tested with comprehensive unit tests
