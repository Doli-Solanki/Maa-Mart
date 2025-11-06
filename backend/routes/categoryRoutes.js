import express from 'express';
const router = express.Router();
import { getCategories } from '../controllers/categoryController.js';

router.route('/').get(getCategories);

export default router;
