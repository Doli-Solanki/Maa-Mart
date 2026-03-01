import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { changePassword } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';

// Create test app
const app = express();
app.use(express.json());
app.post('/api/auth/change-password', authenticate, changePassword);

describe('POST /api/auth/change-password', () => {
  let testUser;
  let authToken;
  const originalPassword = 'oldPassword123';

  beforeEach(async () => {
    // Create a test user with hashed password
    const hashedPassword = await bcrypt.hash(originalPassword, 10);
    testUser = await User.create({
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: hashedPassword,
      role: 'user'
    });

    // Generate auth token
    authToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  });

  afterEach(async () => {
    // Clean up test user
    if (testUser) {
      await User.destroy({ where: { id: testUser.id } });
    }
  });

  describe('Successful password change', () => {
    it('should change password when current password is correct', async () => {
      const newPassword = 'newPassword456';

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: originalPassword,
          newPassword: newPassword
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password changed successfully');

      // Verify password was actually changed in database
      const updatedUser = await User.findByPk(testUser.id);
      const isNewPasswordValid = await bcrypt.compare(newPassword, updatedUser.password);
      expect(isNewPasswordValid).toBe(true);

      // Verify old password no longer works
      const isOldPasswordValid = await bcrypt.compare(originalPassword, updatedUser.password);
      expect(isOldPasswordValid).toBe(false);
    });

    it('should hash the new password before storing', async () => {
      const newPassword = 'newPassword789';

      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: originalPassword,
          newPassword: newPassword
        });

      const updatedUser = await User.findByPk(testUser.id);
      
      // Password should not be stored in plaintext
      expect(updatedUser.password).not.toBe(newPassword);
      
      // Password should be a bcrypt hash (starts with $2a$ or $2b$)
      expect(updatedUser.password).toMatch(/^\$2[ab]\$/);
    });
  });

  describe('Current password verification', () => {
    it('should reject request when current password is incorrect', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'wrongPassword',
          newPassword: 'newPassword456'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Current password is incorrect');

      // Verify password was NOT changed
      const unchangedUser = await User.findByPk(testUser.id);
      const isOriginalPasswordStillValid = await bcrypt.compare(originalPassword, unchangedUser.password);
      expect(isOriginalPasswordStillValid).toBe(true);
    });
  });

  describe('Input validation', () => {
    it('should reject request when currentPassword is missing', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          newPassword: 'newPassword456'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Current password and new password are required');
    });

    it('should reject request when newPassword is missing', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: originalPassword
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Current password and new password are required');
    });

    it('should reject request when both passwords are missing', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Current password and new password are required');
    });

    it('should reject request when currentPassword is not a string', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 12345,
          newPassword: 'newPassword456'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid input format');
    });

    it('should reject request when newPassword is not a string', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: originalPassword,
          newPassword: 12345
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid input format');
    });

    it('should reject request when newPassword is too short', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: originalPassword,
          newPassword: '12345' // Only 5 characters
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('New password must be at least 6 characters');
    });
  });

  describe('Authentication', () => {
    it('should reject request when no auth token is provided', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: originalPassword,
          newPassword: 'newPassword456'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token provided');
    });

    it('should reject request when auth token is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          currentPassword: originalPassword,
          newPassword: 'newPassword456'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid token');
    });
  });

  describe('Edge cases', () => {
    it('should handle same password for current and new', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: originalPassword,
          newPassword: originalPassword
        });

      // Should succeed - no requirement to prevent this
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle special characters in password', async () => {
      const newPassword = 'P@ssw0rd!#$%^&*()';

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: originalPassword,
          newPassword: newPassword
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify password works
      const updatedUser = await User.findByPk(testUser.id);
      const isPasswordValid = await bcrypt.compare(newPassword, updatedUser.password);
      expect(isPasswordValid).toBe(true);
    });

    it('should handle very long password', async () => {
      const newPassword = 'a'.repeat(100);

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: originalPassword,
          newPassword: newPassword
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
