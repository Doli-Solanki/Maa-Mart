# Implementation Plan: Indian E-commerce Improvements

## Overview

This implementation plan breaks down the Indian e-commerce improvements into discrete, incremental coding tasks. The plan follows a logical progression: infrastructure setup, critical bug fixes, security enhancements, feature additions, and user experience improvements. Each task builds on previous work and includes testing to validate correctness early.

The implementation uses TypeScript for frontend (React) and JavaScript for backend (Node.js/Express), maintaining consistency with the existing codebase.

## Tasks

- [x] 1. Setup and Infrastructure
  - Create database migration for new tables (Reviews, AuditLogs)
  - Add indexes to existing tables (Users.email, Orders.userId, Products.categoryId)
  - Install required dependencies (fast-check, express-rate-limit, helmet, validator)
  - Set up testing framework configuration for property-based tests
  - _Requirements: 17.1, 17.2, 17.3_

- [ ] 2. Currency Localization
  - [x] 2.1 Create currency formatting utility
    - Implement formatINR function with Indian locale formatting
    - Export currency symbol constant
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ]* 2.2 Write property test for currency formatting
    - **Property 1: INR Currency Display Consistency**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
  
  - [x] 2.3 Update frontend components to use INR formatting
    - Replace all $ symbols with formatINR utility in ProductCard, CartPage, WishlistPage, AdminDashboard, OrderManagement
    - Update Razorpay integration to use INR currency
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ] 3. Inventory Management Bug Fixes
  - [x] 3.1 Implement stock validation in order creation
    - Add stock availability check before order creation
    - Return error if insufficient stock for any item
    - _Requirements: 2.2, 2.3_
  
  - [ ]* 3.2 Write property test for insufficient stock rejection
    - **Property 3: Insufficient Stock Rejection**
    - **Validates: Requirements 2.2, 2.3**
  
  - [x] 3.3 Implement atomic stock reduction
    - Wrap order creation and stock updates in Sequelize transaction
    - Reduce stock for each order item within transaction
    - _Requirements: 2.1, 2.4_
  
  - [ ]* 3.4 Write property test for stock reduction
    - **Property 2: Stock Reduction on Successful Payment**
    - **Validates: Requirements 2.1**
  
  - [ ]* 3.5 Write property test for stock update atomicity
    - **Property 4: Stock Update Atomicity**
    - **Validates: Requirements 2.4**
  
  - [ ]* 3.6 Write property test for failed payment stock invariant
    - **Property 5: Failed Payment Stock Invariant**
    - **Validates: Requirements 2.5**

- [ ] 4. Order History Implementation
  - [x] 4.1 Create GET /api/orders endpoint
    - Implement getUserOrders controller method
    - Filter orders by authenticated user ID
    - Include order items, status, and timestamps
    - Sort by creation date descending
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 4.2 Write property test for user order filtering
    - **Property 6: User Order Filtering**
    - **Validates: Requirements 3.1**
  
  - [ ]* 4.3 Write property test for order data completeness
    - **Property 7: Order Data Completeness**
    - **Validates: Requirements 3.2**
  
  - [ ]* 4.4 Write property test for order chronological sorting
    - **Property 8: Order Chronological Sorting**
    - **Validates: Requirements 3.3, 11.4**
  
  - [x] 4.5 Create OrderHistory frontend component
    - Fetch orders from GET /api/orders
    - Display orders with all required fields
    - Show order details on click
    - Handle empty state
    - _Requirements: 11.1, 11.2, 11.3, 11.5_
  
  - [ ]* 4.6 Write property test for order history display completeness
    - **Property 9: Order History Display Completeness**
    - **Validates: Requirements 11.2**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Password Change Functionality
  - [x] 6.1 Implement POST /api/auth/change-password endpoint
    - Verify current password with bcrypt
    - Hash new password
    - Update user password in database
    - Return success/error response
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 6.2 Write property test for current password verification
    - **Property 10: Current Password Verification**
    - **Validates: Requirements 4.1**
  
  - [ ]* 6.3 Write property test for invalid password rejection
    - **Property 11: Invalid Password Rejection**
    - **Validates: Requirements 4.2**
  
  - [ ]* 6.4 Write property test for password update success
    - **Property 12: Password Update Success**
    - **Validates: Requirements 4.3**
  
  - [ ]* 6.5 Write property test for password hashing invariant
    - **Property 13: Password Hashing Invariant**
    - **Validates: Requirements 4.4**
  
  - [ ] 6.6 Add password change UI in user profile
    - Create form with current password, new password, confirm password fields
    - Call change-password endpoint
    - Display success/error messages
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 7. Transaction Atomicity for Payments
  - [ ] 7.1 Refactor payment verification to use transactions
    - Wrap payment verification, order status update, and stock reduction in single transaction
    - Implement rollback on any failure
    - Update order status to "failed" on payment failure
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2_
  
  - [ ]* 7.2 Write property test for payment transaction atomicity
    - **Property 14: Payment Transaction Atomicity**
    - **Validates: Requirements 5.1, 5.4**
  
  - [ ]* 7.3 Write property test for transaction rollback completeness
    - **Property 15: Transaction Rollback Completeness**
    - **Validates: Requirements 5.2, 5.3**
  
  - [ ]* 7.4 Write property test for failed payment status update
    - **Property 16: Failed Payment Status Update**
    - **Validates: Requirements 6.1**
  
  - [ ]* 7.5 Write property test for failed order stock invariant
    - **Property 17: Failed Order Stock Invariant**
    - **Validates: Requirements 6.2**
  
  - [ ] 7.6 Add payment timeout handling
    - Implement timeout for payment verification
    - Mark orders as "failed" on timeout
    - Log failed payment attempts
    - _Requirements: 6.3, 6.4_
  
  - [ ] 7.7 Update frontend to display failed order status
    - Show failed/cancelled orders with distinct styling
    - Display appropriate error messages
    - _Requirements: 6.5_

- [ ] 8. Security Middleware Implementation
  - [ ] 8.1 Implement rate limiting middleware
    - Install and configure express-rate-limit
    - Apply 10 requests per 15 minutes limit to payment endpoints
    - Return 429 status with retry-after header
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 8.2 Write property test for rate limit request tracking
    - **Property 18: Rate Limit Request Tracking**
    - **Validates: Requirements 7.1**
  
  - [ ]* 8.3 Write property test for rate limit enforcement
    - **Property 19: Rate Limit Enforcement**
    - **Validates: Requirements 7.2**
  
  - [ ] 8.4 Implement input sanitization middleware
    - Install validator and sanitize-html libraries
    - Create middleware to sanitize all request bodies and query parameters
    - Remove HTML tags, script tags, and SQL injection patterns
    - Apply to all routes
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 8.5 Write property test for malicious content removal
    - **Property 20: Malicious Content Removal**
    - **Validates: Requirements 8.1**
  
  - [ ]* 8.6 Write property test for input type validation
    - **Property 21: Input Type Validation**
    - **Validates: Requirements 8.2**
  
  - [ ]* 8.7 Write property test for SQL injection prevention
    - **Property 22: SQL Injection Prevention**
    - **Validates: Requirements 8.3**
  
  - [ ]* 8.8 Write property test for XSS prevention
    - **Property 23: XSS Prevention**
    - **Validates: Requirements 8.4**
  
  - [ ]* 8.9 Write property test for validation error response
    - **Property 24: Validation Error Response**
    - **Validates: Requirements 8.5**
  
  - [ ] 8.10 Implement CSRF protection middleware
    - Install csurf package
    - Generate CSRF tokens on session creation
    - Verify tokens on state-changing requests
    - Return 403 for invalid tokens
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 8.11 Write property test for CSRF token verification
    - **Property 25: CSRF Token Verification**
    - **Validates: Requirements 9.3**
  
  - [ ]* 8.12 Write property test for invalid CSRF token rejection
    - **Property 26: Invalid CSRF Token Rejection**
    - **Validates: Requirements 9.4**
  
  - [ ] 8.13 Implement secure error handler middleware
    - Create error handler that logs detailed errors
    - Return generic messages in production
    - Hide stack traces and database details
    - Implement environment-specific behavior
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ]* 8.14 Write property test for sensitive information concealment
    - **Property 27: Sensitive Information Concealment**
    - **Validates: Requirements 10.2, 10.3**

- [ ] 9. Checkpoint - Security validation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Email Notification System
  - [ ] 10.1 Set up email service
    - Install nodemailer
    - Configure SMTP settings
    - Create email templates for order confirmation and status updates
    - _Requirements: 12.1, 12.2, 12.5_
  
  - [ ] 10.2 Implement order confirmation email
    - Create sendOrderConfirmation function
    - Include order ID, items, quantities, prices, total, delivery info
    - Send asynchronously (non-blocking)
    - Log failures without blocking order creation
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [ ]* 10.3 Write property test for order confirmation email sending
    - **Property 28: Order Confirmation Email Sending**
    - **Validates: Requirements 12.1**
  
  - [ ]* 10.4 Write property test for email content completeness
    - **Property 29: Email Content Completeness**
    - **Validates: Requirements 12.2**
  
  - [ ]* 10.5 Write property test for email non-blocking behavior
    - **Property 30: Email Non-Blocking Behavior**
    - **Validates: Requirements 12.3, 12.4**
  
  - [ ] 10.6 Implement status update email
    - Create sendOrderStatusUpdate function
    - Trigger on order status changes
    - Include order details and new status
    - _Requirements: 12.5_
  
  - [ ]* 10.7 Write property test for status update email sending
    - **Property 31: Status Update Email Sending**
    - **Validates: Requirements 12.5**
  
  - [ ] 10.8 Integrate email sending into order flow
    - Call sendOrderConfirmation after successful order creation
    - Call sendOrderStatusUpdate in order status update endpoint
    - _Requirements: 12.1, 12.5_

- [ ] 11. Backend Product Search
  - [ ] 11.1 Implement GET /api/products/search endpoint
    - Accept query parameter for search term
    - Search product names and descriptions
    - Perform case-insensitive matching
    - Return matching products or empty array
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ]* 11.2 Write property test for search term matching
    - **Property 32: Search Term Matching**
    - **Validates: Requirements 13.1, 13.3**
  
  - [ ]* 11.3 Write property test for case-insensitive search
    - **Property 33: Case-Insensitive Search**
    - **Validates: Requirements 13.4**
  
  - [ ] 11.4 Update frontend to use backend search
    - Replace frontend-only search with API call to /api/products/search
    - Display search results
    - Handle empty results
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 12. Pagination Implementation
  - [ ] 12.1 Add pagination to product endpoints
    - Accept page and pageSize query parameters
    - Return paginated results with metadata (total, currentPage, totalPages, pageSize)
    - Default to page size of 20
    - Handle out-of-range page requests
    - _Requirements: 14.1, 14.3, 14.4, 14.5_
  
  - [ ]* 12.2 Write property test for product pagination correctness
    - **Property 34: Product Pagination Correctness**
    - **Validates: Requirements 14.1**
  
  - [ ]* 12.3 Write property test for pagination metadata completeness
    - **Property 36: Pagination Metadata Completeness**
    - **Validates: Requirements 14.3**
  
  - [ ] 12.4 Add pagination to order endpoints
    - Apply same pagination logic to GET /api/orders
    - Return paginated order history
    - _Requirements: 14.2, 14.3, 14.4, 14.5_
  
  - [ ]* 12.5 Write property test for order pagination correctness
    - **Property 35: Order Pagination Correctness**
    - **Validates: Requirements 14.2**
  
  - [ ] 12.6 Update frontend components to use pagination
    - Add pagination controls to product list and order history
    - Handle page navigation
    - Display pagination metadata
    - _Requirements: 14.1, 14.2, 14.3_

- [ ] 13. Low Stock Alerts
  - [ ] 13.1 Implement GET /api/products/low-stock endpoint
    - Return products with stock <= 10 units
    - Include product name, stock quantity, and product ID
    - Restrict to admin users only
    - _Requirements: 15.1, 15.2, 15.3, 15.4_
  
  - [ ]* 13.2 Write property test for low stock filtering
    - **Property 37: Low Stock Filtering**
    - **Validates: Requirements 15.1, 15.3**
  
  - [ ]* 13.3 Write property test for low stock display completeness
    - **Property 38: Low Stock Display Completeness**
    - **Validates: Requirements 15.4**
  
  - [ ] 13.4 Add low stock alerts to admin dashboard
    - Fetch low stock products
    - Display with warning styling
    - Show product name, current stock, and product ID
    - _Requirements: 15.1, 15.4, 15.5_

- [ ] 14. Checkpoint - Feature validation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Product Reviews and Ratings
  - [ ] 15.1 Create Review model and migration
    - Define Review model with productId, userId, rating, reviewText, timestamps
    - Add unique constraint on userId + productId
    - Create database migration
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_
  
  - [ ] 15.2 Implement review endpoints
    - GET /api/reviews/product/:productId - Get product reviews
    - POST /api/reviews - Create review (validate user purchased product)
    - PUT /api/reviews/:id - Update review
    - DELETE /api/reviews/:id - Delete review
    - _Requirements: 16.1, 16.2, 16.3_
  
  - [ ]* 15.3 Write property test for review display completeness
    - **Property 39: Review Display Completeness**
    - **Validates: Requirements 16.1**
  
  - [ ]* 15.4 Write property test for review submission authorization
    - **Property 40: Review Submission Authorization**
    - **Validates: Requirements 16.3**
  
  - [ ] 15.5 Implement average rating calculation
    - Calculate average rating after each review submission
    - Update product averageRating and totalReviews fields
    - _Requirements: 16.4_
  
  - [ ]* 15.6 Write property test for average rating calculation
    - **Property 41: Average Rating Calculation**
    - **Validates: Requirements 16.4**
  
  - [ ] 15.7 Create ProductReview frontend component
    - Display existing reviews with ratings, text, reviewer name, date
    - Show review submission form for users who purchased product
    - Display average rating and total reviews
    - _Requirements: 16.1, 16.2, 16.5_
  
  - [ ]* 15.8 Write property test for product rating display
    - **Property 42: Product Rating Display**
    - **Validates: Requirements 16.5**
  
  - [ ] 15.9 Integrate reviews into product pages
    - Add ProductReview component to product detail page
    - Display average rating on product cards
    - _Requirements: 16.1, 16.5_

- [ ] 16. Order Items Validation
  - [ ] 16.1 Implement comprehensive order items validation
    - Validate items array structure (productId, quantity, price required)
    - Validate productId references existing product
    - Validate quantity is positive integer
    - Validate price is positive number
    - Return validation errors with field information
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_
  
  - [ ]* 16.2 Write property test for order items structure validation
    - **Property 43: Order Items Structure Validation**
    - **Validates: Requirements 18.1**
  
  - [ ]* 16.3 Write property test for product reference validation
    - **Property 44: Product Reference Validation**
    - **Validates: Requirements 18.2**
  
  - [ ]* 16.4 Write property test for quantity validation
    - **Property 45: Quantity Validation**
    - **Validates: Requirements 18.3**
  
  - [ ]* 16.5 Write property test for price validation
    - **Property 46: Price Validation**
    - **Validates: Requirements 18.4**
  
  - [ ]* 16.6 Write property test for order items validation rejection
    - **Property 47: Order Items Validation Rejection**
    - **Validates: Requirements 18.5**

- [ ] 17. Audit Logging System
  - [ ] 17.1 Create AuditLog model and migration
    - Define AuditLog model with adminId, action, resourceType, resourceId, changes, timestamp
    - Create database migration with indexes
    - _Requirements: 19.1, 19.2, 19.3, 19.4_
  
  - [ ] 17.2 Implement audit logging service
    - Create logAction function
    - Capture before/after state for updates
    - Log admin ID, action type, resource details, changes
    - _Requirements: 19.1, 19.2, 19.3, 19.4_
  
  - [ ]* 17.3 Write property test for product action audit logging
    - **Property 48: Product Action Audit Logging**
    - **Validates: Requirements 19.1**
  
  - [ ]* 17.4 Write property test for stock modification audit logging
    - **Property 49: Stock Modification Audit Logging**
    - **Validates: Requirements 19.2**
  
  - [ ]* 17.5 Write property test for order status audit logging
    - **Property 50: Order Status Audit Logging**
    - **Validates: Requirements 19.3**
  
  - [ ]* 17.6 Write property test for audit log entry completeness
    - **Property 51: Audit Log Entry Completeness**
    - **Validates: Requirements 19.4**
  
  - [ ] 17.7 Integrate audit logging into admin actions
    - Add audit logging to product create/update/delete
    - Add audit logging to stock modifications
    - Add audit logging to order status updates
    - _Requirements: 19.1, 19.2, 19.3_
  
  - [ ] 17.8 Implement GET /api/admin/audit-logs endpoint
    - Return audit logs with filtering and pagination
    - Restrict to admin users only
    - _Requirements: 19.5_
  
  - [ ] 17.9 Add audit log viewer to admin dashboard
    - Display audit logs with all details
    - Add filtering by action type, resource type, date range
    - _Requirements: 19.5_

- [ ] 18. Loading States and UX Improvements
  - [ ] 18.1 Create LoadingSpinner component
    - Implement reusable loading spinner with optional message
    - Support different sizes
    - _Requirements: 20.1, 20.2, 20.5_
  
  - [ ] 18.2 Add loading states to all async operations
    - Product fetching, cart operations, checkout, order history
    - Display loading spinner during operations
    - Disable interactive elements during loading
    - Show appropriate loading messages
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_
  
  - [ ]* 18.3 Write property test for loading indicator display
    - **Property 52: Loading Indicator Display**
    - **Validates: Requirements 20.1, 20.2**
  
  - [ ]* 18.4 Write property test for interactive element disabling
    - **Property 53: Interactive Element Disabling**
    - **Validates: Requirements 20.4**
  
  - [ ]* 18.5 Write property test for loading message display
    - **Property 54: Loading Message Display**
    - **Validates: Requirements 20.5**
  
  - [ ] 18.3 Improve error messages across application
    - Replace technical error messages with user-friendly text
    - Add field-specific validation error messages
    - Add network error handling with retry suggestions
    - _Requirements: 21.1, 21.3, 21.4_
  
  - [ ]* 18.7 Write property test for error message clarity
    - **Property 55: Error Message Clarity**
    - **Validates: Requirements 21.1**
  
  - [ ]* 18.8 Write property test for validation error specificity
    - **Property 56: Validation Error Specificity**
    - **Validates: Requirements 21.3**

- [ ] 19. Product Filters
  - [ ] 19.1 Implement product filtering in backend
    - Add support for priceMin, priceMax, minRating, inStockOnly query parameters
    - Filter products based on provided criteria
    - Support combining multiple filters
    - _Requirements: 22.1, 22.2, 22.3, 22.4_
  
  - [ ]* 19.2 Write property test for price range filter correctness
    - **Property 57: Price Range Filter Correctness**
    - **Validates: Requirements 22.1**
  
  - [ ]* 19.3 Write property test for rating filter correctness
    - **Property 58: Rating Filter Correctness**
    - **Validates: Requirements 22.2**
  
  - [ ]* 19.4 Write property test for availability filter correctness
    - **Property 59: Availability Filter Correctness**
    - **Validates: Requirements 22.3**
  
  - [ ]* 19.5 Write property test for combined filter correctness
    - **Property 60: Combined Filter Correctness**
    - **Validates: Requirements 22.4**
  
  - [ ] 19.6 Create ProductFilters frontend component
    - Add filter controls for price range, rating, availability
    - Display active filters with clear buttons
    - Apply filters to product list
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_

- [ ] 20. Order Status Tracking
  - [ ] 20.1 Implement order status management
    - Add status field validation (pending, confirmed, processing, shipped, delivered, cancelled, failed)
    - Implement status transition validation
    - Track updatedAt timestamp on status changes
    - _Requirements: 23.1, 23.2, 23.4, 23.5_
  
  - [ ]* 20.2 Write property test for order status display
    - **Property 61: Order Status Display**
    - **Validates: Requirements 23.1**
  
  - [ ]* 20.3 Write property test for order status update persistence
    - **Property 62: Order Status Update Persistence**
    - **Validates: Requirements 23.2**
  
  - [ ]* 20.4 Write property test for status transition validation
    - **Property 63: Status Transition Validation**
    - **Validates: Requirements 23.4**
  
  - [ ]* 20.5 Write property test for status change timestamp tracking
    - **Property 64: Status Change Timestamp Tracking**
    - **Validates: Requirements 23.5**
  
  - [ ] 20.6 Update PATCH /api/orders/:id/status endpoint
    - Validate status transitions
    - Update order status and timestamp
    - Trigger status update email
    - Create audit log entry
    - _Requirements: 23.2, 23.4, 23.5_
  
  - [ ] 20.7 Add order status display to frontend
    - Show current status with visual indicators
    - Display status in order history and order details
    - _Requirements: 23.1, 23.3_

- [ ] 21. Mobile Responsiveness
  - [ ] 21.1 Implement responsive layouts
    - Update product grids to adjust columns based on screen width
    - Ensure minimum touch target size (44x44 pixels)
    - Add mobile-friendly navigation menu
    - Test on various screen sizes
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5_
  
  - [ ] 21.2 Test mobile responsiveness
    - Manual testing on mobile devices
    - Verify all features work on mobile
    - Check text readability without zooming
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5_

- [ ] 22. Final Integration and Testing
  - [ ] 22.1 Integration testing
    - Test complete user flows (browse, add to cart, checkout, view orders)
    - Test admin flows (manage products, view dashboard, check audit logs)
    - Verify all security middleware is active
    - Test error handling across all endpoints
    - _Requirements: All_
  
  - [ ] 22.2 Performance testing
    - Test with large datasets
    - Verify pagination performance
    - Check database query performance with indexes
    - _Requirements: 17.1, 17.2, 17.3, 14.1, 14.2_
  
  - [ ] 22.3 Security audit
    - Verify rate limiting is active
    - Test CSRF protection
    - Verify input sanitization
    - Check error messages don't expose sensitive info
    - _Requirements: 7.1, 7.2, 8.1, 9.3, 10.2_

- [ ] 23. Final Checkpoint - Production readiness
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- All security middleware should be tested thoroughly before production deployment
- Email functionality requires SMTP configuration
- Razorpay integration should be tested in sandbox mode before production
- Mobile responsiveness requires manual testing on actual devices
