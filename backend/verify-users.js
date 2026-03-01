import dotenv from 'dotenv';
import { User } from './models/index.js';

dotenv.config();

async function verifyUsers() {
  try {
    console.log('🔍 Checking user accounts...\n');
    
    const admin = await User.findOne({ where: { email: 'admin@example.com' } });
    const user = await User.findOne({ where: { email: 'user@example.com' } });
    
    console.log('📋 Account Summary:');
    console.log('─────────────────────────────────────────');
    
    if (admin) {
      console.log('✅ Admin Account:');
      console.log('   Email:', admin.email);
      console.log('   Name:', admin.name);
      console.log('   Role:', admin.role);
      console.log('   Password: admin123');
      console.log('');
    } else {
      console.log('❌ Admin account not found');
      console.log('');
    }
    
    if (user) {
      console.log('✅ User Account:');
      console.log('   Email:', user.email);
      console.log('   Name:', user.name);
      console.log('   Role:', user.role);
      console.log('   Password: user123');
      console.log('');
    } else {
      console.log('❌ User account not found');
      console.log('');
    }
    
    console.log('─────────────────────────────────────────');
    console.log('\n📝 Login Instructions:');
    console.log('');
    console.log('For Admin Access:');
    console.log('  Email: admin@example.com');
    console.log('  Password: admin123');
    console.log('  → Will see: Profile, Admin Panel, Logout');
    console.log('');
    console.log('For Regular User Access:');
    console.log('  Email: user@example.com');
    console.log('  Password: user123');
    console.log('  → Will see: Profile, My Orders, Logout');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyUsers();
