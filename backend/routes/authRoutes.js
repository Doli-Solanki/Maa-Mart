import express from 'express';
const router = express.Router();
import { register, login, changePassword } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', authenticate, changePassword);

export default router;
