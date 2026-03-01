# Requirements Document: Indian E-commerce Improvements

## Introduction

This document specifies requirements for improving an existing e-commerce grocery store application to better serve the Indian market. The improvements include currency localization, critical bug fixes, security enhancements, missing features, database optimizations, and user experience improvements. The application uses React TypeScript frontend with Node.js Express backend and MySQL database, integrated with Razorpay for payments.

## Glossary

- **Application**: The e-commerce grocery store system consisting of frontend and backend components
- **User**: A customer who browses products, makes purchases, and views order history
- **Admin**: A system administrator who manages products, inventory, and monitors orders
- **Cart**: A temporary collection of products selected by a User for purchase
- **Order**: A confirmed purchase transaction with associated products and payment details
- **Inventory**: The stock quantity available for each product
- **Payment_Gateway**: Razorpay payment processing service
- **Backend**: Node.js Express server with Sequelize ORM and MySQL database
- **Frontend**: React TypeScript application with Vite and Tailwind CSS
- **Order_Item**: Individual product entry within an Order with quantity and price
- **Stock**: The available quantity of a product in inventory
- **Transaction**: An atomic database operation ensuring data consistency
- **Rate_Limiter**: Middleware that restricts the number of requests from a client
- **CSRF_Token**: Cross-Site Request Forgery protection token
- **JWT**: JSON Web Token used for authentication
- **Audit_Log**: Record of administrative actions for security and compliance

## Requirements

### Requirement 1: Currency Localization

**User Story:** As a User, I want to see all prices in Indian Rupees (₹), so that I can understand the cost in my local currency.

#### Acceptance Criteria

1. WHEN a User views any product price, THEN THE Frontend SHALL display the price with the ₹ symbol
2. WHEN a User views their cart, THEN THE Frontend SHALL display all prices and totals with the ₹ symbol
3. WHEN a User views their wishlist, THEN THE Frontend SHALL display all prices with the ₹ symbol
4. WHEN an Admin views the dashboard, THEN THE Frontend SHALL display all revenue and price information with the ₹ symbol
5. WHEN an Admin manages orders, THEN THE Frontend SHALL display all order amounts with the ₹ symbol
6. WHEN the Payment_Gateway processes a payment, THEN THE Backend SHALL send the amount in INR currency format
7. THE Application SHALL maintain consistency of the ₹ symbol across all price displays

### Requirement 2: Inventory Management

**User Story:** As an Admin, I want inventory to automatically decrease after successful purchases, so that stock levels remain accurate.

#### Acceptance Criteria

1. WHEN a User completes a successful payment, THEN THE Backend SHALL reduce the Stock quantity for each Order_Item by the purchased quantity
2. WHEN inventory is updated, THEN THE Backend SHALL verify sufficient Stock exists before allowing the purchase
3. IF insufficient Stock exists for any Order_Item, THEN THE Backend SHALL reject the order and return an error message
4. WHEN Stock is reduced, THEN THE Backend SHALL ensure the operation is part of an atomic Transaction
5. WHEN a payment fails, THEN THE Backend SHALL NOT reduce the Stock quantity

### Requirement 3: Order History Retrieval

**User Story:** As a User, I want to view my past orders, so that I can track my purchase history.

#### Acceptance Criteria

1. WHEN a User requests their order history, THEN THE Backend SHALL return all Orders associated with that User's account
2. WHEN the Backend returns order history, THEN THE Backend SHALL include Order_Item details, quantities, prices, and order status
3. WHEN the Backend returns order history, THEN THE Backend SHALL sort orders by creation date in descending order
4. THE Backend SHALL implement a GET /api/orders endpoint for retrieving user order history
5. WHEN a User is not authenticated, THEN THE Backend SHALL reject the order history request with an authentication error

### Requirement 4: Password Change Functionality

**User Story:** As a User, I want to change my password, so that I can maintain account security.

#### Acceptance Criteria

1. WHEN a User submits a password change request with current and new passwords, THEN THE Backend SHALL verify the current password is correct
2. IF the current password is incorrect, THEN THE Backend SHALL reject the request and return an error message
3. WHEN the current password is verified, THEN THE Backend SHALL update the User's password with the new password
4. WHEN updating the password, THEN THE Backend SHALL hash the new password before storing it
5. WHEN a password is successfully changed, THEN THE Backend SHALL return a success confirmation

### Requirement 5: Transaction Atomicity

**User Story:** As a system architect, I want payment verification and order updates to be atomic, so that data consistency is maintained.

#### Acceptance Criteria

1. WHEN processing a payment verification, THEN THE Backend SHALL execute payment verification, order status update, and inventory reduction within a single Transaction
2. IF any step in the payment process fails, THEN THE Backend SHALL roll back all changes made in that Transaction
3. WHEN a Transaction is rolled back, THEN THE Backend SHALL restore the previous state of Orders and Stock
4. WHEN a Transaction completes successfully, THEN THE Backend SHALL commit all changes atomically
5. THE Backend SHALL ensure no partial updates occur if payment verification fails

### Requirement 6: Orphaned Order Handling

**User Story:** As an Admin, I want failed payments to be properly handled, so that orphaned orders do not clutter the system.

#### Acceptance Criteria

1. WHEN payment verification fails, THEN THE Backend SHALL mark the Order status as "failed" or "cancelled"
2. WHEN an Order is marked as failed, THEN THE Backend SHALL NOT reduce inventory Stock
3. WHEN payment verification times out, THEN THE Backend SHALL handle the timeout gracefully and mark the Order appropriately
4. THE Backend SHALL log all failed payment attempts for audit purposes
5. WHEN a User views their order history, THEN THE Frontend SHALL clearly indicate failed or cancelled orders

### Requirement 7: Rate Limiting

**User Story:** As a system administrator, I want rate limiting on payment endpoints, so that the system is protected from abuse and DDoS attacks.

#### Acceptance Criteria

1. WHEN a client makes requests to payment endpoints, THEN THE Rate_Limiter SHALL track the number of requests per client
2. WHEN a client exceeds the allowed request limit within the time window, THEN THE Rate_Limiter SHALL reject subsequent requests with a 429 status code
3. THE Backend SHALL implement rate limiting with a maximum of 10 requests per 15 minutes per client for payment endpoints
4. WHEN a rate limit is exceeded, THEN THE Backend SHALL return a clear error message indicating the rate limit and retry time
5. THE Rate_Limiter SHALL use client IP address or authenticated user ID for tracking requests

### Requirement 8: Input Sanitization

**User Story:** As a security engineer, I want all user inputs sanitized, so that the system is protected from injection attacks.

#### Acceptance Criteria

1. WHEN the Backend receives any user input, THEN THE Backend SHALL sanitize the input to remove potentially malicious content
2. THE Backend SHALL validate input types, lengths, and formats before processing
3. WHEN the Backend constructs database queries, THEN THE Backend SHALL use parameterized queries to prevent SQL injection
4. WHEN the Backend processes text input, THEN THE Backend SHALL escape HTML and script tags to prevent XSS attacks
5. IF input validation fails, THEN THE Backend SHALL reject the request and return a validation error message

### Requirement 9: CSRF Protection

**User Story:** As a security engineer, I want CSRF protection implemented, so that users are protected from cross-site request forgery attacks.

#### Acceptance Criteria

1. WHEN a User initiates a session, THEN THE Backend SHALL generate a unique CSRF_Token
2. WHEN the Frontend makes state-changing requests, THEN THE Frontend SHALL include the CSRF_Token in the request
3. WHEN the Backend receives a state-changing request, THEN THE Backend SHALL verify the CSRF_Token is valid
4. IF the CSRF_Token is missing or invalid, THEN THE Backend SHALL reject the request with a 403 status code
5. THE Backend SHALL implement CSRF protection for all POST, PUT, PATCH, and DELETE endpoints

### Requirement 10: Secure Error Handling

**User Story:** As a security engineer, I want error messages to not expose sensitive information, so that attackers cannot gain system insights.

#### Acceptance Criteria

1. WHEN an error occurs, THEN THE Backend SHALL log detailed error information for debugging
2. WHEN the Backend returns an error to the Frontend, THEN THE Backend SHALL return only generic, user-friendly error messages
3. THE Backend SHALL NOT expose stack traces, database schema details, or internal system information in error responses
4. WHEN a database error occurs, THEN THE Backend SHALL return a generic "internal server error" message to the client
5. THE Backend SHALL implement different error handling for development and production environments

### Requirement 11: Order History Page

**User Story:** As a User, I want a dedicated order history page, so that I can easily view and manage my past orders.

#### Acceptance Criteria

1. WHEN a User navigates to the order history page, THEN THE Frontend SHALL display all of the User's past orders
2. WHEN displaying orders, THEN THE Frontend SHALL show order date, order ID, total amount, status, and Order_Items
3. WHEN a User clicks on an order, THEN THE Frontend SHALL display detailed information including individual Order_Items with quantities and prices
4. THE Frontend SHALL display orders in reverse chronological order (newest first)
5. WHEN no orders exist, THEN THE Frontend SHALL display a message indicating no order history

### Requirement 12: Email Notifications

**User Story:** As a User, I want to receive email confirmation when I place an order, so that I have a record of my purchase.

#### Acceptance Criteria

1. WHEN an Order is successfully created, THEN THE Backend SHALL send an email notification to the User's registered email address
2. WHEN sending order confirmation emails, THEN THE Backend SHALL include order ID, Order_Items, quantities, prices, total amount, and delivery information
3. THE Backend SHALL send emails asynchronously to avoid blocking the order creation process
4. IF email sending fails, THEN THE Backend SHALL log the failure but NOT prevent order creation
5. WHEN an Order status changes, THEN THE Backend SHALL send a status update email to the User

### Requirement 13: Backend Product Search

**User Story:** As a User, I want to search for products on the backend, so that search results are consistent and efficient.

#### Acceptance Criteria

1. WHEN a User submits a search query, THEN THE Backend SHALL search product names and descriptions for matching terms
2. THE Backend SHALL implement a GET /api/products/search endpoint that accepts a query parameter
3. WHEN searching products, THEN THE Backend SHALL return results that match any word in the search query
4. THE Backend SHALL perform case-insensitive search matching
5. WHEN no products match the search query, THEN THE Backend SHALL return an empty array

### Requirement 14: Pagination

**User Story:** As a User, I want paginated product and order lists, so that pages load quickly and I can navigate large datasets easily.

#### Acceptance Criteria

1. WHEN the Backend returns product lists, THEN THE Backend SHALL support pagination with page number and page size parameters
2. WHEN the Backend returns order lists, THEN THE Backend SHALL support pagination with page number and page size parameters
3. THE Backend SHALL return pagination metadata including total count, current page, total pages, and page size
4. THE Backend SHALL default to page size of 20 items when not specified
5. WHEN a User requests a page beyond the available data, THEN THE Backend SHALL return an empty results array with valid pagination metadata

### Requirement 15: Low Stock Alerts

**User Story:** As an Admin, I want to receive alerts when product stock is low, so that I can reorder inventory before items run out.

#### Acceptance Criteria

1. WHEN the Admin views the dashboard, THEN THE Frontend SHALL display products with Stock below the threshold quantity
2. THE Backend SHALL implement a GET /api/products/low-stock endpoint that returns products below the threshold
3. THE Backend SHALL define low stock threshold as 10 units or less
4. WHEN displaying low stock alerts, THEN THE Frontend SHALL show product name, current Stock quantity, and product ID
5. THE Frontend SHALL visually highlight low stock items with warning colors or icons

### Requirement 16: Product Reviews and Ratings

**User Story:** As a User, I want to read and write product reviews, so that I can make informed purchasing decisions and share my experience.

#### Acceptance Criteria

1. WHEN a User views a product, THEN THE Frontend SHALL display existing reviews with ratings, review text, reviewer name, and review date
2. WHEN a User has purchased a product, THEN THE Frontend SHALL allow the User to submit a review with a rating (1-5 stars) and review text
3. WHEN a User submits a review, THEN THE Backend SHALL validate the User has purchased the product before accepting the review
4. THE Backend SHALL calculate and store the average rating for each product based on all reviews
5. WHEN displaying products, THEN THE Frontend SHALL show the average rating and total number of reviews

### Requirement 17: Database Indexes

**User Story:** As a database administrator, I want indexes on frequently queried fields, so that query performance is optimized.

#### Acceptance Criteria

1. THE Backend SHALL create a database index on the Users table email field
2. THE Backend SHALL create a database index on the Orders table userId field
3. THE Backend SHALL create a database index on the Products table categoryId field
4. WHEN queries use indexed fields, THEN THE Backend SHALL utilize the indexes for improved performance
5. THE Backend SHALL create composite indexes where multiple fields are frequently queried together

### Requirement 18: Order Items Validation

**User Story:** As a database administrator, I want proper validation for Order items JSON structure, so that data integrity is maintained.

#### Acceptance Criteria

1. WHEN an Order is created, THEN THE Backend SHALL validate the Order_Items JSON structure contains required fields (productId, quantity, price)
2. THE Backend SHALL validate that productId references an existing product
3. THE Backend SHALL validate that quantity is a positive integer
4. THE Backend SHALL validate that price is a positive number
5. IF Order_Items validation fails, THEN THE Backend SHALL reject the order creation and return a validation error

### Requirement 19: Audit Logging

**User Story:** As a system administrator, I want audit logs for admin actions, so that I can track changes and maintain security compliance.

#### Acceptance Criteria

1. WHEN an Admin creates, updates, or deletes a product, THEN THE Backend SHALL create an Audit_Log entry
2. WHEN an Admin modifies inventory Stock, THEN THE Backend SHALL create an Audit_Log entry
3. WHEN an Admin updates order status, THEN THE Backend SHALL create an Audit_Log entry
4. THE Audit_Log SHALL include timestamp, admin user ID, action type, affected resource, and changes made
5. THE Backend SHALL implement a GET /api/admin/audit-logs endpoint for retrieving audit history

### Requirement 20: Loading States

**User Story:** As a User, I want to see loading indicators during async operations, so that I know the application is processing my request.

#### Acceptance Criteria

1. WHEN the Frontend initiates an async operation, THEN THE Frontend SHALL display a loading indicator
2. WHEN the async operation completes, THEN THE Frontend SHALL hide the loading indicator
3. THE Frontend SHALL display loading states for product fetching, cart operations, checkout, and order history
4. WHEN a loading state is active, THEN THE Frontend SHALL disable interactive elements to prevent duplicate submissions
5. THE Frontend SHALL display appropriate loading messages indicating what operation is in progress

### Requirement 21: User-Friendly Error Messages

**User Story:** As a User, I want clear and helpful error messages, so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN an error occurs, THEN THE Frontend SHALL display a user-friendly error message in plain language
2. THE Frontend SHALL avoid displaying technical jargon or error codes to Users
3. WHEN a validation error occurs, THEN THE Frontend SHALL indicate which field has the error and what needs to be corrected
4. WHEN a network error occurs, THEN THE Frontend SHALL display a message suggesting the User check their connection and retry
5. THE Frontend SHALL provide actionable guidance in error messages when possible

### Requirement 22: Product Filters

**User Story:** As a User, I want to filter products by price range, rating, and availability, so that I can find products that meet my criteria.

#### Acceptance Criteria

1. WHEN a User applies a price range filter, THEN THE Backend SHALL return only products within the specified price range
2. WHEN a User applies a rating filter, THEN THE Backend SHALL return only products with average rating equal to or greater than the specified rating
3. WHEN a User applies an availability filter, THEN THE Backend SHALL return only products with Stock greater than zero
4. THE Backend SHALL support combining multiple filters simultaneously
5. WHEN filters are applied, THEN THE Frontend SHALL display the active filters and allow Users to clear them

### Requirement 23: Order Tracking Status

**User Story:** As a User, I want to see the current status of my orders, so that I know when to expect delivery.

#### Acceptance Criteria

1. WHEN a User views an Order, THEN THE Frontend SHALL display the current order status (pending, confirmed, processing, shipped, delivered, cancelled)
2. WHEN an Order status changes, THEN THE Backend SHALL update the order status field in the database
3. THE Frontend SHALL display order status with visual indicators (icons, colors, progress bars)
4. WHEN an Admin updates order status, THEN THE Backend SHALL validate the status transition is valid
5. THE Backend SHALL track status change timestamps for each Order

### Requirement 24: Mobile Responsiveness

**User Story:** As a User, I want the application to work well on mobile devices, so that I can shop conveniently from my phone.

#### Acceptance Criteria

1. WHEN a User accesses the application on a mobile device, THEN THE Frontend SHALL adapt the layout to fit the screen size
2. THE Frontend SHALL ensure all interactive elements are easily tappable on touch screens (minimum 44x44 pixels)
3. WHEN displaying product grids, THEN THE Frontend SHALL adjust the number of columns based on screen width
4. THE Frontend SHALL ensure text is readable without zooming on mobile devices
5. WHEN a User navigates on mobile, THEN THE Frontend SHALL provide a mobile-friendly navigation menu (hamburger menu or bottom navigation)
