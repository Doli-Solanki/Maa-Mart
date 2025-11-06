import express from 'express';
const router = express.Router();
import { listOrders, placeOrder } from '../controllers/orderController.js';
import { authenticate } from '../middleware/authMiddleware.js';

// All order routes require authentication
router.use(authenticate);

router.get('/', listOrders);
router.post('/', placeOrder);

export default router;
