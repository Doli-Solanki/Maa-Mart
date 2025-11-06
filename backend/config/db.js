// backend/config/db.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASS', 'DB_HOST'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ CRITICAL: Missing required environment variables:', missingVars.join(', '));
  console.error('Please set these variables in your .env file');
  process.exit(1);
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

// Note: Authentication is handled in server.js after models are loaded
// This allows proper error handling and prevents app from starting with invalid DB config

export default sequelize;
