import express from 'express';
import { createOrder, verifyPayment, getPaymentDetails } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create Razorpay order (requires authentication)
router.post('/create-order', authenticate, createOrder);

// Verify payment (requires authentication)
router.post('/verify-payment', authenticate, verifyPayment);

// Get payment details (requires authentication)
router.get('/payment/:paymentId', authenticate, getPaymentDetails);

export default router;
