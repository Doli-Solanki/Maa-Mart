import dotenv from 'dotenv';
import { Order, User } from './models/index.js';

dotenv.config();

async function checkOrders() {
  try {
    console.log('📦 Checking orders in database...\n');
    
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Total orders: ${orders.length}\n`);
    
    if (orders.length === 0) {
      console.log('❌ No orders found in database');
      console.log('\nThis means orders are not being saved when you checkout.');
      console.log('Check the payment flow and order creation logic.');
    } else {
      console.log('Orders found:');
      console.log('─────────────────────────────────────────');
      
      for (const order of orders) {
        const user = await User.findByPk(order.userId);
        console.log(`\nOrder #${order.id}:`);
        console.log(`  User ID: ${order.userId}`);
        console.log(`  User Email: ${user?.email || 'unknown'}`);
        console.log(`  Total: ₹${order.totalPrice}`);
        console.log(`  Status: ${order.status || 'N/A'}`);
        console.log(`  Payment Status: ${order.paymentStatus || 'N/A'}`);
        console.log(`  Items: ${order.items?.length || 0}`);
        console.log(`  Created: ${order.createdAt}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkOrders();
