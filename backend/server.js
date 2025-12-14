import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import sequelize from "./config/db.js";
// Ensure models are loaded and associations are defined before sync
import "./models/index.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

/* ----------------------- Required ENV sanity checks ----------------------- */
if (!process.env.JWT_SECRET) {
  console.error("❌ CRITICAL: JWT_SECRET environment variable is required!");
  process.exit(1);
}

/* --------------------------------- App ----------------------------------- */
const app = express();

// Security: Helmet for security headers
try {
  app.use(helmet());
} catch (err) {
  console.error("Error setting up helmet:", err);
}

// Request logging
try {
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }
} catch (err) {
  console.error("Error setting up morgan:", err);
}

const corsOptions = {
  origin:
    process.env.FRONTEND_URL ||
    (process.env.NODE_ENV === "production" ? false : "http://localhost:5173"),
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from uploads directory
// Create uploads directory if it doesn't exist
const uploadsBaseDir = path.join(__dirname, "uploads");
try {
  if (!fs.existsSync(uploadsBaseDir)) {
    fs.mkdirSync(uploadsBaseDir, { recursive: true });
    console.log("✅ Uploads base directory created");
  }
  app.use("/uploads", express.static(uploadsBaseDir));
} catch (error) {
  console.error(
    "⚠️ Warning: Could not set up uploads directory:",
    error.message
  );
  // Server can still run without static file serving
}

/* ----------------------------- Rate limiting ----------------------------- */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { message: "Too many login attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === "/health";
  },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === "/health";
  },
});

// Apply rate limiting (after CORS and body parsing)
app.use("/api/auth", authLimiter);
app.use("/api/", generalLimiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/", (req, res) => res.json({ message: "Grocery API running" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);

// Global error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
  // Don't send response if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  console.error("Error:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ------------------------------ Bootstrapping ---------------------------- */
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // Ensure DB is reachable
    await sequelize.authenticate();
    console.log("✅ MySQL connected successfully!");

    // Only use alter in development, use migrations in production
    const syncOptions =
      process.env.NODE_ENV === "production"
        ? { alter: false } // In production, use migrations instead
        : {}; // In development, allow schema changes

    await sequelize.sync(syncOptions);
    console.log("✅ Database models synced");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  }
})();
