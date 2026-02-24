import express from 'express';
import { createOrder, verifyPayment, getPaymentDetails } from '../controllers/paymentController.js';

const router = express.Router();

// Create Razorpay order
router.post('/create-order', createOrder);

// Verify payment
router.post('/verify-payment', verifyPayment);

// Get payment details
router.get('/payment/:paymentId', getPaymentDetails);

export default router;
