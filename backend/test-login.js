import dotenv from 'dotenv';
import { User } from './models/index.js';
import bcrypt from 'bcryptjs';

dotenv.config();

async function testLogin() {
  try {
    console.log('Testing login credentials...\n');
    
    // Test admin login
    const admin = await User.findOne({ where: { email: 'admin@example.com' } });
    if (admin) {
      const adminPasswordMatch = await bcrypt.compare('admin123', admin.password);
      console.log('✅ Admin user found:');
      console.log('   Email:', admin.email);
      console.log('   Role:', admin.role);
      console.log('   Password "admin123" matches:', adminPasswordMatch);
      console.log('   Password hash length:', admin.password.length);
    } else {
      console.log('❌ Admin user not found');
    }
    
    console.log('');
    
    // Test regular user login
    const user = await User.findOne({ where: { email: 'user@example.com' } });
    if (user) {
      const userPasswordMatch = await bcrypt.compare('user123', user.password);
      console.log('✅ Regular user found:');
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   Password "user123" matches:', userPasswordMatch);
      console.log('   Password hash length:', user.password.length);
    } else {
      console.log('❌ Regular user not found');
    }
    
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('User:  user@example.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testLogin();
