import fc from 'fast-check';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import request from 'supertest';
import express from 'express';
import { changePassword } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';

// Create test app
const app = express();
app.use(express.json());
app.post('/api/auth/change-password', authenticate, changePassword);

// Custom generators
const passwordGenerator = fc.string({ minLength: 6, maxLength: 50 });
const userDataGenerator = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }),
  email: fc.emailAddress(),
  password: passwordGenerator
});

describe('Feature: indian-ecommerce-improvements, Password Change Properties', () => {
  
  /**
   * Property 10: Current Password Verification
   * Validates: Requirements 4.1
   */
  describe('Property 10: Current Password Verification', () => {
    it('should verify current password matches stored hashed password before proceeding', async () => {
      await fc.assert(
        fc.asyncProperty(
          userDataGenerator,
          passwordGenerator,
          async (userData, newPassword) => {
            // Setup: Create user with hashed password
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await User.create({
              name: userData.name,
              email: `test${Date.now()}${Math.random()}@example.com`,
              password: hashedPassword,
              role: 'user'
            });

            const authToken = jwt.sign(
              { id: user.id, email: user.email },
              process.env.JWT_SECRET,
              { expiresIn: '7d' }
            );

            try {
              // Action: Attempt password change with correct current password
              const response = await request(app)
                .post('/api/auth/change-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                  currentPassword: userData.password,
                  newPassword: newPassword
                });

              // Assert: Request should succeed when current password is correct
              expect(response.status).toBe(200);
              expect(response.body.success).toBe(true);

              // Verify the password was actually changed
              const updatedUser = await User.findByPk(user.id);
              const isNewPasswordValid = await bcrypt.compare(newPassword, updatedUser.password);
              expect(isNewPasswordValid).toBe(true);
            } finally {
              // Cleanup
              await User.destroy({ where: { id: user.id } });
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 60000);
  });

  /**
   * Property 11: Invalid Password Rejection
   * Validates: Requirements 4.2
   */
  describe('Property 11: Invalid Password Rejection', () => {
    it('should reject request with incorrect current password without modifying stored password', async () => {
      await fc.assert(
        fc.asyncProperty(
          userDataGenerator,
          passwordGenerator,
          passwordGenerator,
          async (userData, wrongPassword, newPassword) => {
            // Ensure wrong password is different from actual password
            fc.pre(wrongPassword !== userData.password);

            // Setup: Create user with hashed password
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await User.create({
              name: userData.name,
              email: `test${Date.now()}${Math.random()}@example.com`,
              password: hashedPassword,
              role: 'user'
            });

            const authToken = jwt.sign(
              { id: user.id, email: user.email },
              process.env.JWT_SECRET,
              { expiresIn: '7d' }
            );

            try {
              // Action: Attempt password change with incorrect current password
              const response = await request(app)
                .post('/api/auth/change-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                  currentPassword: wrongPassword,
                  newPassword: newPassword
                });

              // Assert: Request should be rejected
              expect(response.status).toBe(400);
              expect(response.body.message).toBe('Current password is incorrect');

              // Verify password was NOT changed
              const unchangedUser = await User.findByPk(user.id);
              const isOriginalPasswordStillValid = await bcrypt.compare(
                userData.password,
                unchangedUser.password
              );
              expect(isOriginalPasswordStillValid).toBe(true);

              // Verify new password was NOT set
              const isNewPasswordSet = await bcrypt.compare(newPassword, unchangedUser.password);
              expect(isNewPasswordSet).toBe(false);
            } finally {
              // Cleanup
              await User.destroy({ where: { id: user.id } });
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 60000);
  });

  /**
   * Property 12: Password Update Success
   * Validates: Requirements 4.3
   */
  describe('Property 12: Password Update Success', () => {
    it('should update user password to new hashed value when current password is valid', async () => {
      await fc.assert(
        fc.asyncProperty(
          userDataGenerator,
          passwordGenerator,
          async (userData, newPassword) => {
            // Setup: Create user with hashed password
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await User.create({
              name: userData.name,
              email: `test${Date.now()}${Math.random()}@example.com`,
              password: hashedPassword,
              role: 'user'
            });

            const authToken = jwt.sign(
              { id: user.id, email: user.email },
              process.env.JWT_SECRET,
              { expiresIn: '7d' }
            );

            try {
              // Action: Change password with valid current password
              const response = await request(app)
                .post('/api/auth/change-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                  currentPassword: userData.password,
                  newPassword: newPassword
                });

              // Assert: Password should be updated
              expect(response.status).toBe(200);

              const updatedUser = await User.findByPk(user.id);
              
              // New password should work
              const isNewPasswordValid = await bcrypt.compare(newPassword, updatedUser.password);
              expect(isNewPasswordValid).toBe(true);

              // Old password should no longer work (unless they're the same)
              if (userData.password !== newPassword) {
                const isOldPasswordValid = await bcrypt.compare(
                  userData.password,
                  updatedUser.password
                );
                expect(isOldPasswordValid).toBe(false);
              }
            } finally {
              // Cleanup
              await User.destroy({ where: { id: user.id } });
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 60000);
  });

  /**
   * Property 13: Password Hashing Invariant
   * Validates: Requirements 4.4
   */
  describe('Property 13: Password Hashing Invariant', () => {
    it('should store password as bcrypt hash, never plaintext', async () => {
      await fc.assert(
        fc.asyncProperty(
          userDataGenerator,
          passwordGenerator,
          async (userData, newPassword) => {
            // Setup: Create user with hashed password
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await User.create({
              name: userData.name,
              email: `test${Date.now()}${Math.random()}@example.com`,
              password: hashedPassword,
              role: 'user'
            });

            const authToken = jwt.sign(
              { id: user.id, email: user.email },
              process.env.JWT_SECRET,
              { expiresIn: '7d' }
            );

            try {
              // Action: Change password
              await request(app)
                .post('/api/auth/change-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                  currentPassword: userData.password,
                  newPassword: newPassword
                });

              // Assert: Password should be stored as bcrypt hash
              const updatedUser = await User.findByPk(user.id);
              
              // Password should not be plaintext
              expect(updatedUser.password).not.toBe(newPassword);
              
              // Password should be a bcrypt hash (starts with $2a$ or $2b$)
              expect(updatedUser.password).toMatch(/^\$2[ab]\$/);
              
              // Password hash should be at least 59 characters (bcrypt standard)
              expect(updatedUser.password.length).toBeGreaterThanOrEqual(59);
              
              // Verify the hash can be used to validate the password
              const isPasswordValid = await bcrypt.compare(newPassword, updatedUser.password);
              expect(isPasswordValid).toBe(true);
            } finally {
              // Cleanup
              await User.destroy({ where: { id: user.id } });
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 60000);
  });

  /**
   * Additional property: Password change should be idempotent for same inputs
   */
  describe('Additional Property: Idempotency', () => {
    it('should produce same result when changing to same password multiple times', async () => {
      await fc.assert(
        fc.asyncProperty(
          userDataGenerator,
          passwordGenerator,
          async (userData, newPassword) => {
            // Setup: Create user
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await User.create({
              name: userData.name,
              email: `test${Date.now()}${Math.random()}@example.com`,
              password: hashedPassword,
              role: 'user'
            });

            const authToken = jwt.sign(
              { id: user.id, email: user.email },
              process.env.JWT_SECRET,
              { expiresIn: '7d' }
            );

            try {
              // First password change
              await request(app)
                .post('/api/auth/change-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                  currentPassword: userData.password,
                  newPassword: newPassword
                });

              const userAfterFirstChange = await User.findByPk(user.id);
              const firstHash = userAfterFirstChange.password;

              // Second password change to same password
              await request(app)
                .post('/api/auth/change-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                  currentPassword: newPassword,
                  newPassword: newPassword
                });

              const userAfterSecondChange = await User.findByPk(user.id);
              
              // Both hashes should validate the same password
              const firstHashValid = await bcrypt.compare(newPassword, firstHash);
              const secondHashValid = await bcrypt.compare(
                newPassword,
                userAfterSecondChange.password
              );
              
              expect(firstHashValid).toBe(true);
              expect(secondHashValid).toBe(true);
            } finally {
              // Cleanup
              await User.destroy({ where: { id: user.id } });
            }
          }
        ),
        { numRuns: 50 }
      );
    }, 60000);
  });
});
