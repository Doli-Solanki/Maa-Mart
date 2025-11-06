import express from 'express';
const router = express.Router();
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';
import { getAllUsers, getUserById, getAllOrders, getOrderById, updateOrderStatus, getDashboardStats } from '../controllers/adminController.js';
import { addProduct, updateProduct, deleteProduct, getProductById } from '../controllers/productController.js';

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);

// Order management
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);

// Product management
router.post('/products', addProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/products/:id', getProductById);

export default router;

