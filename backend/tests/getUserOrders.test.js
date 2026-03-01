import request from 'supertest';
import sequelize from '../config/db.js';
import { User, Order, Product, Category, Review, AuditLog } from '../models/index.js';
import jwt from 'jsonwebtoken';
import express from 'express';
import cors from 'cors';
import orderRoutes from '../routes/orderRoutes.js';

// Create a minimal test app without the full server initialization
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/orders', orderRoutes);
  
  // Error handler
  app.use((err, req, res, next) => {
    console.error('Test app error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  });
  
  return app;
};

describe('GET /api/orders - getUserOrders', () => {
  let testUser;
  let testUser2;
  let authToken;
  let authToken2;
  let app;

  beforeAll(async () => {
    // Database tables should already exist from migration
    // Just authenticate the connection
    await sequelize.authenticate();
    app = createTestApp();
  });

  beforeEach(async () => {
    // Create test users
    testUser = await User.create({
      name: 'Test User 1',
      email: `testuser1_${Date.now()}@example.com`,
      password: 'password123',
      role: 'user'
    });

    testUser2 = await User.create({
      name: 'Test User 2',
      email: `testuser2_${Date.now()}@example.com`,
      password: 'password123',
      role: 'user'
    });

    // Generate auth tokens
    authToken = jwt.sign({ id: testUser.id }, process.env.JWT_SECRET);
    authToken2 = jwt.sign({ id: testUser2.id }, process.env.JWT_SECRET);
  });

  afterEach(async () => {
    // Clean up test data
    await Order.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Requirement 3.1: Filter orders by authenticated user ID', () => {
    it('should return only orders belonging to the authenticated user', async () => {
      // Create orders for both users
      const order1 = await Order.create({
        userId: testUser.id,
        items: [{ productId: 1, productName: 'Product 1', quantity: 2, price: 50 }],
        totalPrice: 100,
        paymentMethod: 'COD',
        address: 'Test Address 1',
        status: 'pending'
      });

      const order2 = await Order.create({
        userId: testUser2.id,
        items: [{ productId: 2, productName: 'Product 2', quantity: 1, price: 75 }],
        totalPrice: 75,
        paymentMethod: 'COD',
        address: 'Test Address 2',
        status: 'pending'
      });

      // Request orders for testUser
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(order1.id);
      expect(response.body[0].userId).toBe(testUser.id);
    });
  });

  describe('Requirement 3.2: Include order items, status, and timestamps', () => {
    it('should return orders with all required fields', async () => {
      const orderData = {
        userId: testUser.id,
        items: [
          { productId: 1, productName: 'Product 1', quantity: 2, price: 50 },
          { productId: 2, productName: 'Product 2', quantity: 1, price: 30 }
        ],
        totalPrice: 130,
        paymentMethod: 'COD',
        address: 'Test Address',
        status: 'confirmed'
      };

      await Order.create(orderData);

      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      
      const order = response.body[0];
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('userId');
      expect(order).toHaveProperty('items');
      expect(order).toHaveProperty('status');
      expect(order).toHaveProperty('createdAt');
      expect(order).toHaveProperty('updatedAt');
      expect(order.items).toEqual(orderData.items);
      expect(order.status).toBe('confirmed');
    });
  });

  describe('Requirement 3.3: Sort by creation date descending', () => {
    it('should return orders sorted by creation date (newest first)', async () => {
      // Clean up any existing orders for this user first
      await Order.destroy({ where: { userId: testUser.id } });
      
      // Create orders with explicit createdAt timestamps to ensure proper ordering
      const now = new Date();
      const order1 = await Order.create({
        userId: testUser.id,
        items: [{ productId: 1, productName: 'Product 1', quantity: 1, price: 50 }],
        totalPrice: 50,
        paymentMethod: 'COD',
        address: 'Address 1',
        status: 'pending',
        createdAt: new Date(now.getTime() - 2000) // 2 seconds ago
      });

      const order2 = await Order.create({
        userId: testUser.id,
        items: [{ productId: 2, productName: 'Product 2', quantity: 1, price: 75 }],
        totalPrice: 75,
        paymentMethod: 'COD',
        address: 'Address 2',
        status: 'pending',
        createdAt: new Date(now.getTime() - 1000) // 1 second ago
      });

      const order3 = await Order.create({
        userId: testUser.id,
        items: [{ productId: 3, productName: 'Product 3', quantity: 1, price: 100 }],
        totalPrice: 100,
        paymentMethod: 'COD',
        address: 'Address 3',
        status: 'pending',
        createdAt: now // now
      });

      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
      
      // Verify orders are sorted by creation date descending (newest first)
      const timestamp1 = new Date(response.body[0].createdAt).getTime();
      const timestamp2 = new Date(response.body[1].createdAt).getTime();
      const timestamp3 = new Date(response.body[2].createdAt).getTime();
      
      expect(timestamp1).toBeGreaterThanOrEqual(timestamp2);
      expect(timestamp2).toBeGreaterThanOrEqual(timestamp3);
      
      // Verify the newest order (order3) is first by checking total price
      expect(response.body[0].totalPrice).toBe(100);
      expect(response.body[1].totalPrice).toBe(75);
      expect(response.body[2].totalPrice).toBe(50);
    });
  });

  describe('Requirement 3.4: GET /api/orders endpoint', () => {
    it('should respond to GET /api/orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return empty array when user has no orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('Requirement 3.5: Authentication required', () => {
    it('should reject requests without authentication token', async () => {
      const response = await request(app)
        .get('/api/orders');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });
});
