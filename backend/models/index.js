import sequelize from '../config/db.js';
import Product from './productModel.js';
import Category from './categoryModel.js';
import User from './userModel.js';
import Order from './orderModel.js';
import Review from './reviewModel.js';
import AuditLog from './auditLogModel.js';
import CartItem from './cartItemModel.js';

// Associations
// Product ↔ Category
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

// Order ↔ User
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });

// Review ↔ Product
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });

// Review ↔ User
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });

// AuditLog ↔ User
AuditLog.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });
User.hasMany(AuditLog, { foreignKey: 'adminId', as: 'auditLogs' });

// CartItem ↔ User
CartItem.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(CartItem, { foreignKey: 'user_id', as: 'cartItems' });

// CartItem ↔ Product
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cartItems' });

export { sequelize, Product, Category, User, Order, Review, AuditLog, CartItem };
export default {
  sequelize,
  Product,
  Category,
  User,
  Order,
  Review,
  AuditLog,
  CartItem,
};


