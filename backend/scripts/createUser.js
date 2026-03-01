import dotenv from "dotenv";
import sequelize from "../config/db.js";
import { User } from "../models/index.js";
import bcrypt from "bcryptjs";

dotenv.config();

const createUser = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const email = process.argv[2] || "user@example.com";
    const password = process.argv[3] || "user123";
    const name = process.argv[4] || "Test User";

    // Check if user already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      // Update to regular user role
      existing.role = "user";
      const hash = await bcrypt.hash(password, 10);
      existing.password = hash;
      existing.name = name;
      await existing.save();
      console.log(`✅ User ${email} updated to regular user role`);
    } else {
      // Create new regular user
      const hash = await bcrypt.hash(password, 10);
      await User.create({
        name,
        email,
        password: hash,
        role: "user",
      });
      console.log(`✅ Regular user created: ${email}`);
    }

    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Role: user`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

createUser();
