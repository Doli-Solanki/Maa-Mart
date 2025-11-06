import sequelize from '../config/db.js';
import Product from './productModel.js';
import Category from './categoryModel.js';
import User from './userModel.js';
import Order from './orderModel.js';

// Associations
// Product ↔ Category
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

// Order ↔ User
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });

export { sequelize, Product, Category, User, Order };
export default {
  sequelize,
  Product,
  Category,
  User,
  Order,
};


