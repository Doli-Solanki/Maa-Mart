// backend/config/db.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// Required environment variables
const requiredEnvVars = ["DB_NAME", "DB_USER", "DB_PASS", "DB_HOST", "DB_PORT"];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  console.error("❌ CRITICAL: Missing required environment variables:", missingVars.join(", "));
  console.error("➡️  Please set them in your .env file inside /backend");
  process.exit(1);
}

const sequelize = new Sequelize(
  process.env.DB_NAME,     // Database name
  process.env.DB_USER,     // Username
  process.env.DB_PASS,     // Password
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    dialectOptions: {
      ssl: process.env.DB_SSL === "true" ? { require: true, rejectUnauthorized: false } : false,
    },
  }
);

// ✅ Test connection once at startup
export const testDBConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully!");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

export default sequelize;
