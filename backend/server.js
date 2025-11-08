// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import sequelize from './config/db.js';     // Sequelize instance (reads .env)
import './models/index.js';                 // ensures models & associations load

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

/* ----------------------- Required ENV sanity checks ----------------------- */
if (!process.env.JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET is required.');
  process.exit(1);
}

/* --------------------------------- App ----------------------------------- */
const app = express();

// If running behind a proxy (Render, Railway, etc.)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// Logging
app.use(process.env.NODE_ENV === 'development' ? morgan('dev') : morgan('combined'));

// CORS: allow your production domain + local dev
const allowedOrigins = [
  process.env.FRONTEND_URL,            // e.g. https://maamart.com
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ----------------------------- Rate limiting ----------------------------- */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
});

app.use('/api/auth', authLimiter);
app.use('/api/', generalLimiter);

/* --------------------------------- Routes -------------------------------- */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.get('/', (_req, res) => res.json({ message: 'Grocery API running' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

/* ----------------------------- Error handlers ---------------------------- */
app.use((err, _req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

/* ------------------------------ Bootstrapping ---------------------------- */
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // Ensure DB is reachable
    await sequelize.authenticate();
    console.log('✅ MySQL connected successfully!');

    // Sync models: alter only in development
    const syncOptions = process.env.NODE_ENV === 'production' ? { alter: false } : { alter: true };
    await sequelize.sync(syncOptions);
    console.log('✅ Database models synced');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
})();
