import express from 'express';
const router = express.Router();
import { listOrders, placeOrder } from '../controllers/orderController.js';

router.get('/', listOrders);
router.post('/', placeOrder);

export default router;
