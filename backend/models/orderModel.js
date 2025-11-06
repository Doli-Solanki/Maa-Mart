import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Order = sequelize.define('Order', {
  userId: { type: DataTypes.INTEGER },
  items: { type: DataTypes.JSON },
  totalPrice: { type: DataTypes.FLOAT },
  paymentMethod: { type: DataTypes.STRING },
  paymentStatus: { type: DataTypes.STRING, defaultValue: 'pending' },
  address: { type: DataTypes.TEXT }
});

export default Order;
