import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import sequelize from './config/db.js';
// Ensure models are loaded and associations are defined before sync
import './models/index.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Grocery API running' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);

const PORT = process.env.PORT || 5000;
sequelize.sync({ alter: true }).then(() => {
  console.log('✅ MySQL connected and models synced');
  app.listen(PORT, () => console.log('🚀 Server running on port', PORT));
}).catch(err => {
  console.error('❌ DB connection error:', err);
});
