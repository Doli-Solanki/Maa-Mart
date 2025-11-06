import express from 'express';
const router = express.Router();

import { getProducts } from '../controllers/productController.js';

router.get('/', getProducts);

export default router;
