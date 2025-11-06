import dotenv from "dotenv";
import sequelize from "../config/db.js";
import { User } from "../models/index.js";
import bcrypt from "bcryptjs";

dotenv.config();

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const email = process.argv[2] || "admin@example.com";
    const password = process.argv[3] || "admin123";
    const name = process.argv[4] || "Admin User";

    // Check if admin already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      // Update to admin if not already
      if (existing.role !== "admin") {
        existing.role = "admin";
        const hash = await bcrypt.hash(password, 10);
        existing.password = hash;
        await existing.save();
        console.log(`✅ User ${email} updated to admin role`);
      } else {
        console.log(`ℹ️  User ${email} is already an admin`);
      }
    } else {
      // Create new admin
      const hash = await bcrypt.hash(password, 10);
      await User.create({
        name,
        email,
        password: hash,
        role: "admin",
      });
      console.log(`✅ Admin user created: ${email}`);
    }

    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log("\n⚠️  Remember to change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

createAdmin();
