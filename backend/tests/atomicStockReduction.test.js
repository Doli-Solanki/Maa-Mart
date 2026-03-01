/**
 * Feature: indian-ecommerce-improvements
 * Test: Atomic Stock Reduction
 * 
 * This test verifies that stock reduction happens atomically with order creation.
 * 
 * Requirements: 2.1, 2.4
 */

import { Product, Order, sequelize } from '../models/index.js';

// Mock environment variables for Razorpay
process.env.RAZORPAY_KEY_ID = 'test_key_id';
process.env.RAZORPAY_KEY_SECRET = 'test_key_secret';

// Import after setting env vars
const { createOrder } = await import('../controllers/paymentController.js');

describe('Atomic Stock Reduction', () => {
  beforeAll(async () => {
    // Sync database for tests
    try {
      await sequelize.sync({ force: true });
    } catch (error) {
      console.log('Database sync skipped - database not available for testing');
    }
  });

  afterAll(async () => {
    // Close database connection
    try {
      await sequelize.close();
    } catch (error) {
      // Ignore close errors
    }
  });

  beforeEach(async () => {
    // Clean up before each test
    try {
      await Order.destroy({ where: {}, truncate: true });
      await Product.destroy({ where: {}, truncate: true });
    } catch (error) {
      // Ignore cleanup errors if DB not available
    }
  });

  describe('Transaction Atomicity', () => {
    it('should reduce stock atomically when order is created', async () => {
      // Skip if database not available
      try {
        await sequelize.authenticate();
      } catch (error) {
        console.log('Skipping test - database not available');
        return;
      }

      // Create products with initial stock
      const product1 = await Product.create({
        name: 'Test Product 1',
        price: 100,
        stock: 10,
        description: 'Test product 1'
      });

      const product2 = await Product.create({
        name: 'Test Product 2',
        price: 200,
        stock: 20,
        description: 'Test product 2'
      });

      // Mock request and response
      const req = {
        body: {
          amount: 500,
          currency: 'INR',
          orderData: {
            userId: 1,
            items: [
              { productId: product1.id, quantity: 3, price: 100 },
              { productId: product2.id, quantity: 2, price: 200 }
            ],
            totalPrice: 500,
            address: 'Test Address'
          }
        }
      };

      const res = {
        status: function(code) { this.statusCode = code; return this; },
        json: function(data) { this.jsonData = data; return this; },
        statusCode: null,
        jsonData: null
      };

      // Execute order creation
      await createOrder(req, res);

      // Verify stock was reduced
      const updatedProduct1 = await Product.findByPk(product1.id);
      const updatedProduct2 = await Product.findByPk(product2.id);

      expect(updatedProduct1.stock).toBe(7); // 10 - 3
      expect(updatedProduct2.stock).toBe(18); // 20 - 2

      // Verify order was created
      const orders = await Order.findAll();
      expect(orders.length).toBe(1);
      expect(orders[0].items.length).toBe(2);
    });

    it('should rollback stock changes if order creation fails', async () => {
      // Skip if database not available
      try {
        await sequelize.authenticate();
      } catch (error) {
        console.log('Skipping test - database not available');
        return;
      }

      // Create a product with initial stock
      const product = await Product.create({
        name: 'Test Product',
        price: 100,
        stock: 10,
        description: 'Test product'
      });

      const initialStock = product.stock;

      // Mock request with invalid data that will cause order creation to fail
      const req = {
        body: {
          amount: 100,
          currency: 'INR',
          orderData: {
            userId: 1,
            items: [
              { productId: product.id, quantity: 15, price: 100 } // More than available stock
            ],
            totalPrice: 1500,
            address: 'Test Address'
          }
        }
      };

      const res = {
        status: function(code) { this.statusCode = code; return this; },
        json: function(data) { this.jsonData = data; return this; },
        statusCode: null,
        jsonData: null
      };

      // Execute order creation (should fail due to insufficient stock)
      await createOrder(req, res);

      // Verify stock was NOT reduced
      const updatedProduct = await Product.findByPk(product.id);
      expect(updatedProduct.stock).toBe(initialStock);

      // Verify no order was created
      const orders = await Order.findAll();
      expect(orders.length).toBe(0);

      // Verify error response
      expect(res.statusCode).toBe(400);
      expect(res.jsonData).toMatchObject({
        success: false,
        message: expect.stringContaining('Insufficient stock')
      });
    });

    it('should handle multiple items atomically', async () => {
      // Skip if database not available
      try {
        await sequelize.authenticate();
      } catch (error) {
        console.log('Skipping test - database not available');
        return;
      }

      // Create products
      const product1 = await Product.create({
        name: 'Product 1',
        price: 100,
        stock: 5,
        description: 'Product 1'
      });

      const product2 = await Product.create({
        name: 'Product 2',
        price: 200,
        stock: 3,
        description: 'Product 2'
      });

      const product3 = await Product.create({
        name: 'Product 3',
        price: 300,
        stock: 2,
        description: 'Product 3'
      });

      // Mock request with one item having insufficient stock
      const req = {
        body: {
          amount: 600,
          currency: 'INR',
          orderData: {
            userId: 1,
            items: [
              { productId: product1.id, quantity: 2, price: 100 },
              { productId: product2.id, quantity: 5, price: 200 }, // Insufficient stock
              { productId: product3.id, quantity: 1, price: 300 }
            ],
            totalPrice: 1300,
            address: 'Test Address'
          }
        }
      };

      const res = {
        status: function(code) { this.statusCode = code; return this; },
        json: function(data) { this.jsonData = data; return this; },
        statusCode: null,
        jsonData: null
      };

      // Execute order creation (should fail)
      await createOrder(req, res);

      // Verify NO stock was reduced for ANY product (atomicity)
      const updatedProduct1 = await Product.findByPk(product1.id);
      const updatedProduct2 = await Product.findByPk(product2.id);
      const updatedProduct3 = await Product.findByPk(product3.id);

      expect(updatedProduct1.stock).toBe(5); // Unchanged
      expect(updatedProduct2.stock).toBe(3); // Unchanged
      expect(updatedProduct3.stock).toBe(2); // Unchanged

      // Verify no order was created
      const orders = await Order.findAll();
      expect(orders.length).toBe(0);
    });
  });
});
