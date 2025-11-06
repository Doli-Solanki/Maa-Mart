# Admin Panel Documentation

## Overview
The admin panel allows administrators to manage products, view users, and manage orders for the grocery store application.

## Features

### 1. Dashboard
- View statistics: Total Users, Total Products, Total Orders, Total Revenue
- Quick overview of pending and completed orders

### 2. Product Management
- **Add Products**: Create new products with name, description, price, stock, category, and image
- **Edit Products**: Update existing product information
- **Delete Products**: Remove products from the store
- View all products in a table format

### 3. User Management
- View all registered users
- See user details: ID, Name, Email, Role, Join Date
- Identify admin users with badges

### 4. Order Management
- View all orders with customer information
- See order details: Items, Total Price, Payment Method, Status, Date
- **Update Order Status**: Change order status (pending, completed, failed)

## Setup Instructions

### 1. Create an Admin User

To create an admin user, run the following command in the backend directory:

```bash
cd backend
npm run create-admin
```

Or with custom credentials:
```bash
npm run create-admin admin@example.com adminpassword123 "Admin Name"
```

**Default credentials:**
- Email: `admin@example.com`
- Password: `admin123`

⚠️ **Important**: Change the default password after first login!

### 2. Access the Admin Panel

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Login with your admin credentials at `/login`

4. Navigate to the Admin Panel:
   - Click on your profile dropdown in the header
   - Select "Admin Panel" (only visible to admin users)
   - Or navigate directly to `/admin`

## API Endpoints

All admin endpoints require authentication and admin role:

### Dashboard
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

### Products
- `POST /api/admin/products` - Create a new product
- `PUT /api/admin/products/:id` - Update a product
- `DELETE /api/admin/products/:id` - Delete a product
- `GET /api/admin/products/:id` - Get product by ID

### Users
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID

### Orders
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/:id` - Get order by ID
- `PUT /api/admin/orders/:id/status` - Update order status

## Security

- All admin routes are protected by JWT authentication
- Admin middleware checks for `role === 'admin'` before allowing access
- Regular users cannot access admin endpoints or see admin panel links

## User Roles

- **user**: Default role for regular customers
- **admin**: Administrative access to manage the store

To manually change a user's role in the database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

## Troubleshooting

### Cannot access admin panel
- Ensure you're logged in with an admin account
- Check that the user's role is set to 'admin' in the database
- Verify JWT token is being sent in API requests

### Products not saving
- Check that all required fields are filled (name, price, stock)
- Verify category ID exists if assigning a category
- Check browser console for error messages

### Orders not loading
- Ensure the database has orders
- Check that user associations are properly set up
- Verify API endpoint is accessible

