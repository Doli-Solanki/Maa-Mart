// Test setup file for Jest
// This file runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

// Global test utilities can be added here
global.testUtils = {
  // Helper function to generate random test data
  generateRandomString: (length = 10) => {
    return Math.random().toString(36).substring(2, length + 2);
  },
  
  // Helper to create test user
  createTestUser: () => ({
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    role: 'user'
  }),
  
  // Helper to create test product
  createTestProduct: () => ({
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    stock: 100,
    categoryId: 1
  })
};
