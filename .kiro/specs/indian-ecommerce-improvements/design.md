# Design Document: Indian E-commerce Improvements

## Overview

This design document outlines the technical approach for improving an existing e-commerce grocery store application for the Indian market. The improvements span currency localization, critical bug fixes, security enhancements, feature additions, database optimizations, and user experience improvements.

The application architecture consists of:
- **Frontend**: React TypeScript with Vite, Tailwind CSS, and React Router
- **Backend**: Node.js Express with Sequelize ORM
- **Database**: MySQL with proper indexing and constraints
- **Payment Gateway**: Razorpay integration for INR transactions
- **Authentication**: JWT-based authentication system

The design prioritizes backward compatibility with existing data while implementing atomic transactions, proper error handling, and security best practices.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Product    │  │     Cart     │  │    Order     │     │
│  │   Pages      │  │   Management │  │   History    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Admin     │  │     Auth     │  │   Reviews    │     │
│  │  Dashboard   │  │   Context    │  │   Component  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                    API Calls (Axios)
                            │
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Product    │  │     Order    │  │     Auth     │     │
│  │  Controller  │  │  Controller  │  │  Controller  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Payment    │  │    Review    │  │    Admin     │     │
│  │  Controller  │  │  Controller  │  │  Controller  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Middleware Layer                         │  │
│  │  • Rate Limiter  • CSRF Protection                   │  │
│  │  • Input Sanitizer  • Error Handler                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                    Sequelize ORM
                            │
┌─────────────────────────────────────────────────────────────┐
│                      MySQL Database                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │ Products │  │  Orders  │  │ Reviews  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐                                │
│  │AuditLogs │  │  Indexes │                                │
│  └──────────┘  └──────────┘                                │
└─────────────────────────────────────────────────────────────┘
                            │
                    External Services
                            │
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────────┐              ┌──────────────┐            │
│  │   Razorpay   │              │    Email     │            │
│  │   Payment    │              │   Service    │            │
│  └──────────────┘              └──────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Request Flow**: Frontend → API Layer → Middleware → Controller → Service → Database
2. **Payment Flow**: Frontend → Backend → Razorpay → Webhook → Backend → Database (Atomic Transaction)
3. **Admin Actions Flow**: Admin Frontend → Backend → Audit Log → Database

## Components and Interfaces

### Frontend Components

#### Currency Display Utility

```typescript
// utils/currency.ts
interface CurrencyFormatter {
  format(amount: number): string;
  symbol: string;
}

const formatINR: CurrencyFormatter = {
  symbol: '₹',
  format: (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
};
```

#### Order History Component

```typescript
// components/OrderHistory.tsx
interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'failed';

interface OrderHistoryProps {
  userId: number;
}

// Component fetches orders via GET /api/orders
// Displays orders in reverse chronological order
// Shows order details, items, and status
```

#### Product Review Component

```typescript
// components/ProductReview.tsx
interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number; // 1-5
  reviewText: string;
  createdAt: Date;
}

interface ReviewFormProps {
  productId: number;
  onSubmit: (rating: number, reviewText: string) => Promise<void>;
}

interface ReviewListProps {
  productId: number;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}
```

#### Loading State Component

```typescript
// components/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

// Displays spinner with optional message
// Used across all async operations
```

#### Product Filter Component

```typescript
// components/ProductFilters.tsx
interface FilterOptions {
  priceRange?: { min: number; max: number };
  minRating?: number;
  inStockOnly?: boolean;
  category?: string;
}

interface ProductFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  activeFilters: FilterOptions;
}
```

### Backend Controllers

#### Order Controller

```typescript
// controllers/orderController.js
interface OrderController {
  // GET /api/orders - Get user's order history
  getUserOrders(req: Request, res: Response): Promise<void>;
  
  // POST /api/orders - Create new order
  createOrder(req: Request, res: Response): Promise<void>;
  
  // GET /api/orders/:id - Get specific order details
  getOrderById(req: Request, res: Response): Promise<void>;
  
  // PATCH /api/orders/:id/status - Update order status (admin)
  updateOrderStatus(req: Request, res: Response): Promise<void>;
}

// Implementation uses Sequelize transactions for atomicity
// Validates order items before creation
// Reduces inventory stock atomically with order creation
```

#### Payment Controller

```typescript
// controllers/paymentController.js
interface PaymentController {
  // POST /api/payment/create-order - Create Razorpay order
  createPaymentOrder(req: Request, res: Response): Promise<void>;
  
  // POST /api/payment/verify - Verify payment and update order
  verifyPayment(req: Request, res: Response): Promise<void>;
}

// Rate limited: 10 requests per 15 minutes
// Uses atomic transactions for payment verification
// Handles failed payments by marking orders as failed
```

#### Product Controller

```typescript
// controllers/productController.js
interface ProductController {
  // GET /api/products - Get all products with pagination
  getProducts(req: Request, res: Response): Promise<void>;
  
  // GET /api/products/search - Search products
  searchProducts(req: Request, res: Response): Promise<void>;
  
  // GET /api/products/low-stock - Get low stock products (admin)
  getLowStockProducts(req: Request, res: Response): Promise<void>;
  
  // GET /api/products/:id - Get product by ID
  getProductById(req: Request, res: Response): Promise<void>;
  
  // POST /api/products - Create product (admin)
  createProduct(req: Request, res: Response): Promise<void>;
  
  // PUT /api/products/:id - Update product (admin)
  updateProduct(req: Request, res: Response): Promise<void>;
  
  // DELETE /api/products/:id - Delete product (admin)
  deleteProduct(req: Request, res: Response): Promise<void>;
}

// Supports filtering by price, rating, availability
// Implements pagination with metadata
// Low stock threshold: 10 units
```

#### Review Controller

```typescript
// controllers/reviewController.js
interface ReviewController {
  // GET /api/reviews/product/:productId - Get product reviews
  getProductReviews(req: Request, res: Response): Promise<void>;
  
  // POST /api/reviews - Create review
  createReview(req: Request, res: Response): Promise<void>;
  
  // PUT /api/reviews/:id - Update review
  updateReview(req: Request, res: Response): Promise<void>;
  
  // DELETE /api/reviews/:id - Delete review
  deleteReview(req: Request, res: Response): Promise<void>;
}

// Validates user has purchased product before allowing review
// Updates product average rating after review submission
// Supports pagination for reviews
```

#### Auth Controller

```typescript
// controllers/authController.js
interface AuthController {
  // POST /api/auth/register - Register new user
  register(req: Request, res: Response): Promise<void>;
  
  // POST /api/auth/login - Login user
  login(req: Request, res: Response): Promise<void>;
  
  // POST /api/auth/change-password - Change password
  changePassword(req: Request, res: Response): Promise<void>;
  
  // GET /api/auth/profile - Get user profile
  getProfile(req: Request, res: Response): Promise<void>;
}

// Password change validates current password
// Hashes new password with bcrypt
// Returns JWT token on successful authentication
```

#### Admin Controller

```typescript
// controllers/adminController.js
interface AdminController {
  // GET /api/admin/audit-logs - Get audit logs
  getAuditLogs(req: Request, res: Response): Promise<void>;
  
  // GET /api/admin/dashboard - Get dashboard statistics
  getDashboardStats(req: Request, res: Response): Promise<void>;
}

// Audit logs include timestamp, admin ID, action, resource, changes
// Dashboard shows revenue, orders, low stock alerts
```

### Middleware Components

#### Rate Limiter Middleware

```typescript
// middleware/rateLimiter.js
interface RateLimiterConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator: (req: Request) => string; // Function to generate unique key
}

// Payment endpoints: 10 requests per 15 minutes
// Uses in-memory store or Redis for production
// Returns 429 status when limit exceeded
```

#### Input Sanitizer Middleware

```typescript
// middleware/sanitizer.js
interface SanitizerMiddleware {
  sanitizeBody(req: Request, res: Response, next: NextFunction): void;
  sanitizeQuery(req: Request, res: Response, next: NextFunction): void;
}

// Removes HTML tags, script tags
// Escapes special characters
// Validates input types and lengths
// Applied to all routes
```

#### CSRF Protection Middleware

```typescript
// middleware/csrf.js
interface CSRFMiddleware {
  generateToken(req: Request, res: Response, next: NextFunction): void;
  verifyToken(req: Request, res: Response, next: NextFunction): void;
}

// Generates CSRF token on session creation
// Verifies token on POST, PUT, PATCH, DELETE requests
// Returns 403 if token invalid or missing
```

#### Error Handler Middleware

```typescript
// middleware/errorHandler.js
interface ErrorResponse {
  message: string;
  statusCode: number;
  stack?: string; // Only in development
}

interface ErrorHandlerMiddleware {
  handle(err: Error, req: Request, res: Response, next: NextFunction): void;
}

// Logs detailed errors for debugging
// Returns generic messages to clients
// Different behavior for development vs production
// Never exposes stack traces or database details in production
```

### Service Layer

#### Email Service

```typescript
// services/emailService.js
interface EmailService {
  sendOrderConfirmation(order: Order, userEmail: string): Promise<void>;
  sendOrderStatusUpdate(order: Order, userEmail: string): Promise<void>;
}

// Uses nodemailer or similar library
// Sends emails asynchronously (non-blocking)
// Logs failures but doesn't block order creation
// Templates include order details, items, total
```

#### Transaction Service

```typescript
// services/transactionService.js
interface TransactionService {
  executeInTransaction<T>(
    callback: (transaction: Transaction) => Promise<T>
  ): Promise<T>;
}

// Wraps Sequelize transaction management
// Automatically rolls back on errors
// Used for payment verification, order creation, inventory updates
```

#### Audit Service

```typescript
// services/auditService.js
interface AuditLog {
  adminId: number;
  action: string;
  resourceType: string;
  resourceId: number;
  changes: object;
  timestamp: Date;
}

interface AuditService {
  logAction(log: AuditLog): Promise<void>;
  getAuditLogs(filters: object, pagination: object): Promise<AuditLog[]>;
}

// Logs all admin actions
// Stores before/after state for updates
// Supports filtering and pagination
```

## Data Models

### Database Schema

#### Users Table

```sql
CREATE TABLE Users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);
```

#### Products Table

```sql
CREATE TABLE Products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  categoryId INT,
  imageUrl VARCHAR(500),
  averageRating DECIMAL(3, 2) DEFAULT 0,
  totalReviews INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_categoryId (categoryId),
  INDEX idx_stock (stock),
  INDEX idx_averageRating (averageRating)
);
```

#### Orders Table

```sql
CREATE TABLE Orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  items JSON NOT NULL,
  totalAmount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'failed') DEFAULT 'pending',
  paymentId VARCHAR(255),
  razorpayOrderId VARCHAR(255),
  razorpayPaymentId VARCHAR(255),
  razorpaySignature VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id),
  INDEX idx_userId (userId),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt)
);
```

#### Reviews Table

```sql
CREATE TABLE Reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  productId INT NOT NULL,
  userId INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  reviewText TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_productId (productId),
  INDEX idx_userId (userId),
  UNIQUE KEY unique_user_product (userId, productId)
);
```

#### AuditLogs Table

```sql
CREATE TABLE AuditLogs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  adminId INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  resourceType VARCHAR(50) NOT NULL,
  resourceId INT,
  changes JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (adminId) REFERENCES Users(id),
  INDEX idx_adminId (adminId),
  INDEX idx_timestamp (timestamp),
  INDEX idx_resourceType (resourceType)
);
```

### Order Items JSON Structure

```json
{
  "items": [
    {
      "productId": 1,
      "productName": "Product Name",
      "quantity": 2,
      "price": 99.99
    }
  ]
}
```

**Validation Rules**:
- Each item must have productId (integer), quantity (positive integer), price (positive number)
- productId must reference existing product
- quantity must not exceed available stock
- price must match current product price (or historical price for order records)

### Sequelize Model Definitions

```typescript
// models/Order.js
const Order = sequelize.define('Order', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidItems(value) {
        if (!Array.isArray(value)) throw new Error('Items must be an array');
        value.forEach(item => {
          if (!item.productId || !item.quantity || !item.price) {
            throw new Error('Each item must have productId, quantity, and price');
          }
          if (item.quantity <= 0) throw new Error('Quantity must be positive');
          if (item.price <= 0) throw new Error('Price must be positive');
        });
      }
    }
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'),
    defaultValue: 'pending'
  },
  razorpayOrderId: DataTypes.STRING,
  razorpayPaymentId: DataTypes.STRING,
  razorpaySignature: DataTypes.STRING
});

// models/Review.js
const Review = sequelize.define('Review', {
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Products', key: 'id' }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  reviewText: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// models/AuditLog.js
const AuditLog = sequelize.define('AuditLog', {
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  resourceType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  resourceId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  changes: {
    type: DataTypes.JSON,
    allowNull: true
  }
});
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, I identified several areas of redundancy:

- **Currency display properties (1.1-1.5)** can be consolidated into a single comprehensive property about currency formatting across all UI components
- **Stock management properties (2.2, 2.3)** are testing the same behavior and can be combined
- **Transaction atomicity properties (5.2, 5.3)** both test rollback behavior and can be combined
- **Error message properties (10.2, 10.3)** both test information disclosure prevention and can be combined
- **Order display properties (3.3, 11.4)** test the same ordering behavior
- Several UI styling properties (15.5, 23.3, 24.1-24.5) are not functionally testable and will be handled through manual testing

The following properties represent the unique, testable behaviors after eliminating redundancy:

### Currency Localization Properties

**Property 1: INR Currency Display Consistency**
*For any* price value displayed in the application (products, cart, wishlist, orders, admin dashboard), the rendered output should contain the ₹ symbol and format the number according to Indian locale conventions (en-IN).
**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

### Inventory Management Properties

**Property 2: Stock Reduction on Successful Payment**
*For any* successful payment transaction, the stock quantity for each product in the order should decrease by exactly the purchased quantity.
**Validates: Requirements 2.1**

**Property 3: Insufficient Stock Rejection**
*For any* order where any item's requested quantity exceeds available stock, the backend should reject the order and return an error without modifying stock levels.
**Validates: Requirements 2.2, 2.3**

**Property 4: Stock Update Atomicity**
*For any* order creation with multiple items, either all stock quantities are reduced or none are reduced (no partial updates).
**Validates: Requirements 2.4**

**Property 5: Failed Payment Stock Invariant**
*For any* payment that fails verification, the stock quantities for all products should remain unchanged from their pre-payment state.
**Validates: Requirements 2.5**

### Order History Properties

**Property 6: User Order Filtering**
*For any* authenticated user requesting order history, all returned orders should have a userId matching the requesting user's ID.
**Validates: Requirements 3.1**

**Property 7: Order Data Completeness**
*For any* order returned by the order history endpoint, the response should include all required fields: order ID, items array, total amount, status, and timestamps.
**Validates: Requirements 3.2**

**Property 8: Order Chronological Sorting**
*For any* order history response with multiple orders, the orders should be sorted by creation date in descending order (newest first).
**Validates: Requirements 3.3, 11.4**

**Property 9: Order History Display Completeness**
*For any* order displayed in the frontend order history, the UI should show order date, order ID, total amount, status, and all order items.
**Validates: Requirements 11.2**

### Password Management Properties

**Property 10: Current Password Verification**
*For any* password change request, the backend should verify the provided current password matches the stored hashed password before proceeding.
**Validates: Requirements 4.1**

**Property 11: Invalid Password Rejection**
*For any* password change request with an incorrect current password, the backend should reject the request and return an error without modifying the stored password.
**Validates: Requirements 4.2**

**Property 12: Password Update Success**
*For any* password change request with valid current password, the backend should update the user's password to the new hashed value.
**Validates: Requirements 4.3**

**Property 13: Password Hashing Invariant**
*For any* password stored in the database, the password field should contain a bcrypt hash, never plaintext.
**Validates: Requirements 4.4**

### Transaction Atomicity Properties

**Property 14: Payment Transaction Atomicity**
*For any* payment verification process, either all operations (payment verification, order status update, inventory reduction) succeed together or all are rolled back together.
**Validates: Requirements 5.1, 5.4**

**Property 15: Transaction Rollback Completeness**
*For any* failed payment transaction, the database state (orders and stock) should be identical to the state before the transaction began.
**Validates: Requirements 5.2, 5.3**

### Orphaned Order Handling Properties

**Property 16: Failed Payment Status Update**
*For any* payment verification that fails, the associated order status should be set to "failed" or "cancelled".
**Validates: Requirements 6.1**

**Property 17: Failed Order Stock Invariant**
*For any* order with status "failed" or "cancelled", the stock quantities should not have been reduced from their pre-order state.
**Validates: Requirements 6.2**

### Rate Limiting Properties

**Property 18: Rate Limit Request Tracking**
*For any* client making requests to payment endpoints, the rate limiter should track the count of requests within the time window.
**Validates: Requirements 7.1**

**Property 19: Rate Limit Enforcement**
*For any* client that has made 10 or more requests to payment endpoints within a 15-minute window, subsequent requests should be rejected with HTTP 429 status.
**Validates: Requirements 7.2**

### Input Sanitization Properties

**Property 20: Malicious Content Removal**
*For any* user input containing HTML tags, script tags, or SQL injection patterns, the sanitized output should have these elements removed or escaped.
**Validates: Requirements 8.1**

**Property 21: Input Type Validation**
*For any* API endpoint expecting specific input types (string, number, email), requests with invalid types should be rejected with validation errors.
**Validates: Requirements 8.2**

**Property 22: SQL Injection Prevention**
*For any* database query constructed with user input, the query should use parameterized statements that prevent SQL injection.
**Validates: Requirements 8.3**

**Property 23: XSS Prevention**
*For any* text input containing script tags or HTML event handlers, the processed output should have these elements escaped or removed.
**Validates: Requirements 8.4**

**Property 24: Validation Error Response**
*For any* input that fails validation, the backend should reject the request and return a clear validation error message.
**Validates: Requirements 8.5**

### CSRF Protection Properties

**Property 25: CSRF Token Verification**
*For any* state-changing request (POST, PUT, PATCH, DELETE), the backend should verify the CSRF token is present and valid.
**Validates: Requirements 9.3**

**Property 26: Invalid CSRF Token Rejection**
*For any* state-changing request with missing or invalid CSRF token, the backend should reject the request with HTTP 403 status.
**Validates: Requirements 9.4**

### Secure Error Handling Properties

**Property 27: Sensitive Information Concealment**
*For any* error response sent to clients in production, the response should not contain stack traces, database schema details, or internal system paths.
**Validates: Requirements 10.2, 10.3**

### Email Notification Properties

**Property 28: Order Confirmation Email Sending**
*For any* successfully created order, an email notification should be sent to the user's registered email address.
**Validates: Requirements 12.1**

**Property 29: Email Content Completeness**
*For any* order confirmation email, the email body should include order ID, all order items with quantities and prices, total amount, and delivery information.
**Validates: Requirements 12.2**

**Property 30: Email Non-Blocking Behavior**
*For any* order creation, the order should be successfully created and saved even if email sending fails.
**Validates: Requirements 12.3, 12.4**

**Property 31: Status Update Email Sending**
*For any* order status change, a status update email should be sent to the user.
**Validates: Requirements 12.5**

### Product Search Properties

**Property 32: Search Term Matching**
*For any* search query, all returned products should have the search term appearing in either the product name or description (case-insensitive).
**Validates: Requirements 13.1, 13.3**

**Property 33: Case-Insensitive Search**
*For any* search query, the results should be identical regardless of the case of the search terms.
**Validates: Requirements 13.4**

### Pagination Properties

**Property 34: Product Pagination Correctness**
*For any* paginated product request, the number of returned items should not exceed the specified page size, and the items should correspond to the correct page offset.
**Validates: Requirements 14.1**

**Property 35: Order Pagination Correctness**
*For any* paginated order request, the number of returned items should not exceed the specified page size, and the items should correspond to the correct page offset.
**Validates: Requirements 14.2**

**Property 36: Pagination Metadata Completeness**
*For any* paginated response, the metadata should include total count, current page number, total pages, and page size.
**Validates: Requirements 14.3**

### Low Stock Alert Properties

**Property 37: Low Stock Filtering**
*For any* request to the low-stock endpoint, all returned products should have stock quantity less than or equal to 10 units.
**Validates: Requirements 15.1, 15.3**

**Property 38: Low Stock Display Completeness**
*For any* low stock product displayed in the admin dashboard, the display should include product name, current stock quantity, and product ID.
**Validates: Requirements 15.4**

### Product Review Properties

**Property 39: Review Display Completeness**
*For any* product review displayed, the UI should show rating, review text, reviewer name, and review date.
**Validates: Requirements 16.1**

**Property 40: Review Submission Authorization**
*For any* review submission, the backend should verify the user has a completed order containing the product before accepting the review.
**Validates: Requirements 16.3**

**Property 41: Average Rating Calculation**
*For any* product with reviews, the stored average rating should equal the sum of all review ratings divided by the total number of reviews.
**Validates: Requirements 16.4**

**Property 42: Product Rating Display**
*For any* product displayed, the UI should show the average rating and total number of reviews.
**Validates: Requirements 16.5**

### Order Items Validation Properties

**Property 43: Order Items Structure Validation**
*For any* order creation request, each item in the items array should contain productId, quantity, and price fields.
**Validates: Requirements 18.1**

**Property 44: Product Reference Validation**
*For any* order item, the productId should reference an existing product in the database.
**Validates: Requirements 18.2**

**Property 45: Quantity Validation**
*For any* order item, the quantity should be a positive integer greater than zero.
**Validates: Requirements 18.3**

**Property 46: Price Validation**
*For any* order item, the price should be a positive number greater than zero.
**Validates: Requirements 18.4**

**Property 47: Order Items Validation Rejection**
*For any* order creation request with invalid items structure, the backend should reject the request and return a validation error.
**Validates: Requirements 18.5**

### Audit Logging Properties

**Property 48: Product Action Audit Logging**
*For any* admin action that creates, updates, or deletes a product, an audit log entry should be created.
**Validates: Requirements 19.1**

**Property 49: Stock Modification Audit Logging**
*For any* admin action that modifies product stock, an audit log entry should be created.
**Validates: Requirements 19.2**

**Property 50: Order Status Audit Logging**
*For any* admin action that updates order status, an audit log entry should be created.
**Validates: Requirements 19.3**

**Property 51: Audit Log Entry Completeness**
*For any* audit log entry, the record should include timestamp, admin user ID, action type, affected resource type and ID, and changes made.
**Validates: Requirements 19.4**

### Loading State Properties

**Property 52: Loading Indicator Display**
*For any* async operation initiated in the frontend, a loading indicator should be displayed until the operation completes or fails.
**Validates: Requirements 20.1, 20.2**

**Property 53: Interactive Element Disabling**
*For any* active loading state, interactive elements (buttons, forms) should be disabled to prevent duplicate submissions.
**Validates: Requirements 20.4**

**Property 54: Loading Message Display**
*For any* loading state, an appropriate message should be displayed indicating what operation is in progress.
**Validates: Requirements 20.5**

### User-Friendly Error Message Properties

**Property 55: Error Message Clarity**
*For any* error displayed to users, the message should be in plain language without technical jargon or error codes.
**Validates: Requirements 21.1**

**Property 56: Validation Error Specificity**
*For any* validation error, the error message should indicate which field failed validation and what correction is needed.
**Validates: Requirements 21.3**

### Product Filter Properties

**Property 57: Price Range Filter Correctness**
*For any* product query with price range filter, all returned products should have prices within the specified minimum and maximum range (inclusive).
**Validates: Requirements 22.1**

**Property 58: Rating Filter Correctness**
*For any* product query with rating filter, all returned products should have average rating greater than or equal to the specified minimum rating.
**Validates: Requirements 22.2**

**Property 59: Availability Filter Correctness**
*For any* product query with availability filter enabled, all returned products should have stock quantity greater than zero.
**Validates: Requirements 22.3**

**Property 60: Combined Filter Correctness**
*For any* product query with multiple filters applied, all returned products should satisfy all filter conditions simultaneously.
**Validates: Requirements 22.4**

### Order Status Tracking Properties

**Property 61: Order Status Display**
*For any* order viewed by a user, the displayed status should match the current status stored in the database.
**Validates: Requirements 23.1**

**Property 62: Order Status Update Persistence**
*For any* order status change, the new status should be persisted to the database.
**Validates: Requirements 23.2**

**Property 63: Status Transition Validation**
*For any* admin request to update order status, the backend should validate the transition is valid (e.g., cannot go from "delivered" to "pending").
**Validates: Requirements 23.4**

**Property 64: Status Change Timestamp Tracking**
*For any* order status change, the updatedAt timestamp should be updated to reflect the change time.
**Validates: Requirements 23.5**


## Error Handling

### Error Classification

Errors are classified into the following categories:

1. **Validation Errors** (400): Invalid input data, missing required fields, format errors
2. **Authentication Errors** (401): Missing or invalid JWT token, expired session
3. **Authorization Errors** (403): Insufficient permissions, invalid CSRF token
4. **Not Found Errors** (404): Resource does not exist
5. **Conflict Errors** (409): Duplicate resource, concurrent modification
6. **Rate Limit Errors** (429): Too many requests
7. **Server Errors** (500): Database errors, external service failures, unexpected errors

### Error Response Format

All error responses follow a consistent structure:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    message: string;        // User-friendly error message
    code: string;           // Error code for client handling
    statusCode: number;     // HTTP status code
    field?: string;         // Field name for validation errors
  };
}
```

### Environment-Specific Error Handling

**Development Environment**:
- Include stack traces in error responses
- Log detailed error information to console
- Return specific database error messages
- Include request details in error logs

**Production Environment**:
- Return only generic error messages
- Never expose stack traces
- Log detailed errors to file/monitoring service
- Sanitize all error responses to prevent information disclosure

### Error Handling Strategies

#### Database Errors

```typescript
try {
  await Order.create(orderData);
} catch (error) {
  logger.error('Database error:', error);
  
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      success: false,
      error: {
        message: 'An error occurred while processing your request',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  } else {
    return res.status(500).json({
      success: false,
      error: {
        message: error.message,
        code: 'DATABASE_ERROR',
        statusCode: 500,
        stack: error.stack
      }
    });
  }
}
```

#### Validation Errors

```typescript
const validateOrderItems = (items) => {
  if (!Array.isArray(items)) {
    throw new ValidationError('Items must be an array', 'items');
  }
  
  items.forEach((item, index) => {
    if (!item.productId) {
      throw new ValidationError(
        'Product ID is required',
        `items[${index}].productId`
      );
    }
    if (!item.quantity || item.quantity <= 0) {
      throw new ValidationError(
        'Quantity must be a positive number',
        `items[${index}].quantity`
      );
    }
  });
};
```

#### Payment Errors

```typescript
try {
  const paymentVerification = await razorpay.verifyPayment(paymentData);
  
  if (!paymentVerification.success) {
    await Order.update(
      { status: 'failed' },
      { where: { id: orderId } }
    );
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Payment verification failed. Please try again.',
        code: 'PAYMENT_FAILED',
        statusCode: 400
      }
    });
  }
} catch (error) {
  logger.error('Payment error:', error);
  
  await Order.update(
    { status: 'failed' },
    { where: { id: orderId } }
  );
  
  return res.status(500).json({
    success: false,
    error: {
      message: 'Payment processing error. Please contact support.',
      code: 'PAYMENT_ERROR',
      statusCode: 500
    }
  });
}
```

#### External Service Errors

```typescript
// Email service errors should not block order creation
try {
  await emailService.sendOrderConfirmation(order, user.email);
} catch (error) {
  logger.error('Email sending failed:', error);
  // Continue execution - email failure is non-critical
}
```

### Frontend Error Handling

```typescript
// API error handling with user-friendly messages
const handleApiError = (error: AxiosError): string => {
  if (error.response) {
    const { statusCode, message } = error.response.data.error;
    
    switch (statusCode) {
      case 400:
        return message || 'Please check your input and try again';
      case 401:
        return 'Please log in to continue';
      case 403:
        return 'You do not have permission to perform this action';
      case 404:
        return 'The requested resource was not found';
      case 429:
        return 'Too many requests. Please wait a moment and try again';
      case 500:
        return 'Something went wrong. Please try again later';
      default:
        return 'An unexpected error occurred';
    }
  } else if (error.request) {
    return 'Network error. Please check your connection and try again';
  } else {
    return 'An unexpected error occurred';
  }
};
```

## Testing Strategy

### Overview

The testing strategy employs a dual approach combining unit tests for specific examples and edge cases with property-based tests for universal correctness properties. This ensures comprehensive coverage while maintaining test maintainability.

### Testing Frameworks

**Backend Testing**:
- **Unit Tests**: Jest
- **Property-Based Tests**: fast-check (JavaScript property-based testing library)
- **Integration Tests**: Supertest for API testing
- **Database**: In-memory SQLite for test isolation

**Frontend Testing**:
- **Unit Tests**: Vitest
- **Property-Based Tests**: fast-check
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright (for critical user flows)

### Property-Based Testing Configuration

All property-based tests must be configured with:
- **Minimum 100 iterations** per test (to ensure adequate randomization coverage)
- **Tag format**: `Feature: indian-ecommerce-improvements, Property {number}: {property_text}`
- **Shrinking enabled**: To find minimal failing examples
- **Seed logging**: To reproduce failures

Example property test structure:

```typescript
import fc from 'fast-check';

describe('Feature: indian-ecommerce-improvements, Property 2: Stock Reduction on Successful Payment', () => {
  it('should reduce stock by purchased quantity for all successful payments', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          productId: fc.integer({ min: 1, max: 100 }),
          quantity: fc.integer({ min: 1, max: 10 }),
          price: fc.float({ min: 1, max: 1000 })
        })),
        async (orderItems) => {
          // Setup: Create products with initial stock
          const products = await setupProductsWithStock(orderItems);
          const initialStock = products.map(p => p.stock);
          
          // Action: Process successful payment
          await processPayment(orderItems);
          
          // Assert: Stock reduced by exact quantity
          const updatedProducts = await getProducts(products.map(p => p.id));
          updatedProducts.forEach((product, index) => {
            expect(product.stock).toBe(
              initialStock[index] - orderItems[index].quantity
            );
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing Strategy

Unit tests focus on:
- **Specific examples**: Concrete test cases that demonstrate correct behavior
- **Edge cases**: Empty inputs, boundary values, null/undefined handling
- **Error conditions**: Invalid inputs, missing data, constraint violations
- **Integration points**: API endpoints, database operations, external services

Unit tests should be concise and focused. Avoid writing excessive unit tests for behaviors already covered by property tests.

### Test Coverage Goals

- **Backend**: 80% code coverage minimum
- **Frontend**: 70% code coverage minimum
- **Critical paths**: 100% coverage (payment, authentication, order creation)
- **Property tests**: All 64 correctness properties implemented

### Testing Layers

#### 1. Unit Tests (Backend)

```typescript
// Example: Order validation unit test
describe('Order Validation', () => {
  it('should reject order with empty items array', async () => {
    const order = { userId: 1, items: [], totalAmount: 0 };
    
    await expect(createOrder(order)).rejects.toThrow('Items array cannot be empty');
  });
  
  it('should reject order with negative quantity', async () => {
    const order = {
      userId: 1,
      items: [{ productId: 1, quantity: -1, price: 10 }],
      totalAmount: 10
    };
    
    await expect(createOrder(order)).rejects.toThrow('Quantity must be positive');
  });
});
```

#### 2. Property Tests (Backend)

```typescript
// Example: Transaction atomicity property test
describe('Feature: indian-ecommerce-improvements, Property 15: Transaction Rollback Completeness', () => {
  it('should restore database state on failed payment', () => {
    fc.assert(
      fc.property(
        fc.record({
          userId: fc.integer({ min: 1, max: 100 }),
          items: fc.array(fc.record({
            productId: fc.integer({ min: 1, max: 50 }),
            quantity: fc.integer({ min: 1, max: 5 }),
            price: fc.float({ min: 1, max: 100 })
          }), { minLength: 1, maxLength: 5 })
        }),
        async (orderData) => {
          // Capture initial state
          const initialState = await captureDbState();
          
          // Simulate payment failure
          await expect(
            processPaymentWithFailure(orderData)
          ).rejects.toThrow();
          
          // Verify state restored
          const currentState = await captureDbState();
          expect(currentState).toEqual(initialState);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### 3. Integration Tests (Backend)

```typescript
// Example: API integration test
describe('Order API Integration', () => {
  it('should create order and reduce stock atomically', async () => {
    const product = await Product.create({
      name: 'Test Product',
      price: 100,
      stock: 10
    });
    
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [{ productId: product.id, quantity: 2, price: 100 }],
        totalAmount: 200
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    
    const updatedProduct = await Product.findByPk(product.id);
    expect(updatedProduct.stock).toBe(8);
  });
});
```

#### 4. Component Tests (Frontend)

```typescript
// Example: Currency display component test
describe('Currency Display', () => {
  it('should display prices with INR symbol', () => {
    render(<ProductCard product={{ name: 'Test', price: 100 }} />);
    
    expect(screen.getByText(/₹100/)).toBeInTheDocument();
  });
});
```

#### 5. Property Tests (Frontend)

```typescript
// Example: Frontend property test
describe('Feature: indian-ecommerce-improvements, Property 1: INR Currency Display Consistency', () => {
  it('should display INR symbol for all price values', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0.01, max: 100000 }),
        (price) => {
          const formatted = formatINR(price);
          expect(formatted).toMatch(/^₹/);
          expect(formatted).toMatch(/\d+\.\d{2}$/);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Data Management

**Generators for Property Tests**:

```typescript
// Custom generators for domain objects
const orderItemGenerator = fc.record({
  productId: fc.integer({ min: 1, max: 1000 }),
  quantity: fc.integer({ min: 1, max: 100 }),
  price: fc.float({ min: 0.01, max: 10000, noNaN: true })
});

const orderGenerator = fc.record({
  userId: fc.integer({ min: 1, max: 10000 }),
  items: fc.array(orderItemGenerator, { minLength: 1, maxLength: 20 }),
  totalAmount: fc.float({ min: 0.01, max: 100000, noNaN: true })
});

const userGenerator = fc.record({
  email: fc.emailAddress(),
  password: fc.string({ minLength: 8, maxLength: 50 }),
  name: fc.string({ minLength: 2, maxLength: 100 })
});
```

**Test Fixtures**:

```typescript
// Reusable test data
const testUsers = {
  admin: { email: 'admin@test.com', password: 'admin123', role: 'admin' },
  user: { email: 'user@test.com', password: 'user123', role: 'user' }
};

const testProducts = [
  { name: 'Rice', price: 50, stock: 100, categoryId: 1 },
  { name: 'Wheat', price: 40, stock: 50, categoryId: 1 },
  { name: 'Milk', price: 60, stock: 30, categoryId: 2 }
];
```

### Continuous Integration

All tests run automatically on:
- Pull request creation
- Commits to main branch
- Scheduled nightly builds

CI pipeline stages:
1. Lint and format check
2. Unit tests (parallel execution)
3. Property tests (parallel execution)
4. Integration tests
5. E2E tests (critical paths only)
6. Coverage report generation

### Manual Testing Checklist

Some requirements require manual verification:
- Mobile responsiveness (Requirement 24)
- Visual design and aesthetics
- Email template rendering
- Payment gateway integration (sandbox testing)
- Performance under load

### Test Maintenance

- Review and update tests when requirements change
- Remove redundant tests after property test implementation
- Keep test execution time under 5 minutes for unit/property tests
- Document complex test scenarios
- Use descriptive test names that explain the behavior being tested

