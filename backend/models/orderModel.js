import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Order = sequelize.define('Order', {
  userId: { type: DataTypes.INTEGER, allowNull: true },
  items: { type: DataTypes.JSON },
  totalPrice: { type: DataTypes.FLOAT },
  paymentMethod: { type: DataTypes.STRING },
  paymentStatus: { type: DataTypes.STRING, defaultValue: 'pending' },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'),
    defaultValue: 'pending'
  },
  address: { type: DataTypes.TEXT },
  razorpayOrderId: { type: DataTypes.STRING, allowNull: true },
  razorpayPaymentId: { type: DataTypes.STRING, allowNull: true },
  razorpaySignature: { type: DataTypes.STRING, allowNull: true }
}, {
  indexes: [
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['createdAt'] }
  ]
});

export default Order;
