import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import sequelize from './config/db.js';
// Ensure models are loaded and associations are defined before sync
import './models/index.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET environment variable is required!');
  process.exit(1);
}

const app = express();

// Security: Helmet for security headers
try {
  app.use(helmet());
} catch (err) {
  console.error('Error setting up helmet:', err);
}

// Request logging
try {
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }
} catch (err) {
  console.error('Error setting up morgan:', err);
}

// Security: Configure CORS properly (before rate limiting)
const corsOptions = {
  origin: process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173'),
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/health';
  }
});

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/health';
  }
});

// Apply rate limiting (after CORS and body parsing)
app.use('/api/auth', authLimiter);
app.use('/api/', generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => res.json({ message: 'Grocery API running' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

// Global error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
  // Don't send response if headers already sent
  if (res.headersSent) {
    return next(err);
  }
  
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Database connection and sync
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connected successfully!');
    
    // Only use alter in development, use migrations in production
    const syncOptions = process.env.NODE_ENV === 'production' 
      ? { alter: false } // In production, use migrations instead
      : { alter: true };   // In development, allow schema changes
    
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
