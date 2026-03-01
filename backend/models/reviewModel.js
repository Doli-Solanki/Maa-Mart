import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Review = sequelize.define('Review', {
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  reviewText: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  indexes: [
    { fields: ['productId'] },
    { fields: ['userId'] },
    { unique: true, fields: ['userId', 'productId'] }
  ]
});

export default Review;
