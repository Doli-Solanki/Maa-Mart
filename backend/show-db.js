// Script to display database contents
import sequelize from './config/db.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Order from './models/orderModel.js';
import Category from './models/categoryModel.js';
import Review from './models/reviewModel.js';

async function showDatabase() {
  try {
    console.log('🔌 Connecting to database...\n');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!\n');

    // Show Users
    console.log('👥 USERS:');
    console.log('='.repeat(80));
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role', 'createdAt'] });
    if (users.length === 0) {
      console.log('No users found');
    } else {
      users.forEach(user => {
        console.log(`ID: ${user.id} | Name: ${user.name} | Email: ${user.email} | Role: ${user.role} | Created: ${user.createdAt.toLocaleDateString()}`);
      });
    }
    console.log(`\nTotal Users: ${users.length}\n`);

    // Show Categories
    console.log('📁 CATEGORIES:');
    console.log('='.repeat(80));
    const categories = await Category.findAll({ attributes: ['id', 'name', 'description'] });
    if (categories.length === 0) {
      console.log('No categories found');
    } else {
      categories.forEach(cat => {
        console.log(`ID: ${cat.id} | Name: ${cat.name} | Description: ${cat.description || 'N/A'}`);
      });
    }
    console.log(`\nTotal Categories: ${categories.length}\n`);

    // Show Products
    console.log('📦 PRODUCTS:');
    console.log('='.repeat(80));
    const products = await Product.findAll({ 
      attributes: ['id', 'name', 'price', 'stock', 'categoryId'],
      include: [{ model: Category, attributes: ['name'] }]
    });
    if (products.length === 0) {
      console.log('No products found');
    } else {
      products.forEach(prod => {
        console.log(`ID: ${prod.id} | Name: ${prod.name} | Price: ₹${prod.price} | Stock: ${prod.stock} | Category: ${prod.Category?.name || 'N/A'}`);
      });
    }
    console.log(`\nTotal Products: ${products.length}\n`);

    // Show Orders
    console.log('🛒 ORDERS:');
    console.log('='.repeat(80));
    const orders = await Order.findAll({ 
      attributes: ['id', 'userId', 'totalAmount', 'status', 'createdAt'],
      include: [{ model: User, attributes: ['name', 'email'] }]
    });
    if (orders.length === 0) {
      console.log('No orders found');
    } else {
      orders.forEach(order => {
        console.log(`ID: ${order.id} | User: ${order.User?.name || 'N/A'} | Amount: ₹${order.totalAmount} | Status: ${order.status} | Date: ${order.createdAt.toLocaleDateString()}`);
      });
    }
    console.log(`\nTotal Orders: ${orders.length}\n`);

    // Show Reviews
    console.log('⭐ REVIEWS:');
    console.log('='.repeat(80));
    const reviews = await Review.findAll({ 
      attributes: ['id', 'userId', 'productId', 'rating', 'comment'],
      include: [
        { model: User, attributes: ['name'] },
        { model: Product, attributes: ['name'] }
      ]
    });
    if (reviews.length === 0) {
      console.log('No reviews found');
    } else {
      reviews.forEach(review => {
        console.log(`ID: ${review.id} | User: ${review.User?.name || 'N/A'} | Product: ${review.Product?.name || 'N/A'} | Rating: ${review.rating}/5`);
        if (review.comment) console.log(`   Comment: ${review.comment}`);
      });
    }
    console.log(`\nTotal Reviews: ${reviews.length}\n`);

    console.log('✅ Database overview complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

showDatabase();
