/**
 * Feature: indian-ecommerce-improvements
 * Test: Stock Validation in Order Creation
 * 
 * This test verifies that stock validation is properly implemented
 * in the order creation process.
 * 
 * Requirements: 2.2, 2.3
 */

import { Product, Order } from '../models/index.js';
import sequelize from '../config/db.js';

// Mock environment variables for Razorpay
process.env.RAZORPAY_KEY_ID = 'test_key_id';
process.env.RAZORPAY_KEY_SECRET = 'test_key_secret';

// Import after setting env vars
const { createOrder } = await import('../controllers/paymentController.js');

describe('Stock Validation in Order Creation', () => {
  beforeAll(async () => {
    // Sync database for tests
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Close database connection
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await Order.destroy({ where: {}, truncate: true });
    await Product.destroy({ where: {}, truncate: true });
  });

  // Helper to create mock request and response objects
  const createMockReqRes = (body) => {
    const req = { body };
    const res = {
      status: function(code) { this.statusCode = code; return this; },
      json: function(data) { this.jsonData = data; return this; },
      statusCode: null,
      jsonData: null
    };
    return { req, res };
  };

  describe('Sufficient Stock Validation', () => {
    it('should create order when sufficient stock is available', async () => {
      // Create a product with stock
      const product = await Product.create({
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        categoryId: 1
      });

      const { req, res } = createMockReqRes({
        amount: 200,
        currency: 'INR',
        orderData: {
          userId: 1,
          items: [
            {
              productId: product.id,
              quantity: 5,
              price: 100
            }
          ],
          totalPrice: 500,
          address: 'Test Address'
        }
      });

      await createOrder(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.jsonData).toMatchObject({
        success: true,
        dbOrderId: expect.any(Number)
      });
    });
  });

  describe('Insufficient Stock Rejection', () => {
    it('should reject order when insufficient stock for a product', async () => {
      // Create a product with limited stock
      const product = await Product.create({
        name: 'Limited Stock Product',
        description: 'Test Description',
        price: 100,
        stock: 3,
        categoryId: 1
      });

      const { req, res } = createMockReqRes({
        amount: 500,
        currency: 'INR',
        orderData: {
          userId: 1,
          items: [
            {
              productId: product.id,
              quantity: 5, // Requesting more than available
              price: 100
            }
          ],
          totalPrice: 500,
          address: 'Test Address'
        }
      });

      await createOrder(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.jsonData).toMatchObject({
        success: false,
        message: expect.stringContaining('Insufficient stock')
      });
      
      expect(res.jsonData.message).toContain('Available: 3');
      expect(res.jsonData.message).toContain('Requested: 5');
    });

    it('should reject order when any item has insufficient stock', async () => {
      // Create two products
      const product1 = await Product.create({
        name: 'Product 1',
        description: 'Test Description',
        price: 100,
        stock: 10,
        categoryId: 1
      });

      const product2 = await Product.create({
        name: 'Product 2',
        description: 'Test Description',
        price: 50,
        stock: 2,
        categoryId: 1
      });

      const { req, res } = createMockReqRes({
        amount: 400,
        currency: 'INR',
        orderData: {
          userId: 1,
          items: [
            {
              productId: product1.id,
              quantity: 5, // This is fine
              price: 100
            },
            {
              productId: product2.id,
              quantity: 5, // This exceeds stock
              price: 50
            }
          ],
          totalPrice: 750,
          address: 'Test Address'
        }
      });

      await createOrder(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.jsonData).toMatchObject({
        success: false,
        message: expect.stringContaining('Insufficient stock')
      });
      
      expect(res.jsonData.message).toContain('Product 2');
    });

    it('should not create order in database when stock validation fails', async () => {
      const product = await Product.create({
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 2,
        categoryId: 1
      });

      const { req, res } = createMockReqRes({
        amount: 500,
        currency: 'INR',
        orderData: {
          userId: 1,
          items: [
            {
              productId: product.id,
              quantity: 10,
              price: 100
            }
          ],
          totalPrice: 1000,
          address: 'Test Address'
        }
      });

      await createOrder(req, res);

      // Verify no order was created
      const orderCount = await Order.count();
      expect(orderCount).toBe(0);
    });
  });

  describe('Product Validation', () => {
    it('should reject order when product does not exist', async () => {
      const { req, res } = createMockReqRes({
        amount: 100,
        currency: 'INR',
        orderData: {
          userId: 1,
          items: [
            {
              productId: 99999, // Non-existent product
              quantity: 1,
              price: 100
            }
          ],
          totalPrice: 100,
          address: 'Test Address'
        }
      });

      await createOrder(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.jsonData).toMatchObject({
        success: false,
        message: expect.stringContaining('Product with ID 99999 not found')
      });
    });

    it('should reject order when item is missing productId', async () => {
      const { req, res } = createMockReqRes({
        amount: 100,
        currency: 'INR',
        orderData: {
          userId: 1,
          items: [
            {
              quantity: 1,
              price: 100
            }
          ],
          totalPrice: 100,
          address: 'Test Address'
        }
      });

      await createOrder(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.jsonData).toMatchObject({
        success: false,
        message: expect.stringContaining('productId and quantity are required')
      });
    });

    it('should reject order when item is missing quantity', async () => {
      const product = await Product.create({
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        categoryId: 1
      });

      const { req, res } = createMockReqRes({
        amount: 100,
        currency: 'INR',
        orderData: {
          userId: 1,
          items: [
            {
              productId: product.id,
              price: 100
            }
          ],
          totalPrice: 100,
          address: 'Test Address'
        }
      });

      await createOrder(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.jsonData).toMatchObject({
        success: false,
        message: expect.stringContaining('productId and quantity are required')
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero stock correctly', async () => {
      const product = await Product.create({
        name: 'Out of Stock Product',
        description: 'Test Description',
        price: 100,
        stock: 0,
        categoryId: 1
      });

      const { req, res } = createMockReqRes({
        amount: 100,
        currency: 'INR',
        orderData: {
          userId: 1,
          items: [
            {
              productId: product.id,
              quantity: 1,
              price: 100
            }
          ],
          totalPrice: 100,
          address: 'Test Address'
        }
      });

      await createOrder(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.jsonData).toMatchObject({
        success: false,
        message: expect.stringContaining('Insufficient stock')
      });
      
      expect(res.jsonData.message).toContain('Available: 0');
    });

    it('should allow order when quantity exactly matches stock', async () => {
      const product = await Product.create({
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 5,
        categoryId: 1
      });

      const { req, res } = createMockReqRes({
        amount: 500,
        currency: 'INR',
        orderData: {
          userId: 1,
          items: [
            {
              productId: product.id,
              quantity: 5, // Exactly matches stock
              price: 100
            }
          ],
          totalPrice: 500,
          address: 'Test Address'
        }
      });

      await createOrder(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.jsonData).toMatchObject({
        success: true
      });
    });
  });
});
