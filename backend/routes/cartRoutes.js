import express from 'express';
const router = express.Router();
import { authenticate } from '../middleware/authMiddleware.js';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    syncCart,
    validateCart,
} from '../controllers/cartController.js';

// All cart routes require authentication
router.use(authenticate);

router.get('/', getCart);                        // GET    /api/cart
router.post('/', addToCart);                      // POST   /api/cart
router.post('/sync', syncCart);                   // POST   /api/cart/sync
router.post('/validate', validateCart);           // POST   /api/cart/validate
router.put('/:productId', updateCartItem);        // PUT    /api/cart/:productId
router.delete('/:productId', removeCartItem);     // DELETE /api/cart/:productId
router.delete('/', clearCart);                    // DELETE /api/cart

export default router;
