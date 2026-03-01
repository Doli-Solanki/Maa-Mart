import express from 'express';
const router = express.Router();
import { getUserOrders, listOrders, placeOrder } from '../controllers/orderController.js';
import { authenticate } from '../middleware/authMiddleware.js';

// All order routes require authentication
router.use(authenticate);

// GET /api/orders - Get authenticated user's orders (Requirement 3.4)
router.get('/', getUserOrders);
router.post('/', placeOrder);

export default router;
