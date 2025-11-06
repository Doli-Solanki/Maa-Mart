import { DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/db.js';

const Category = sequelize.define('Category', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  // Let Sequelize manage created_at / updated_at when `timestamps: true` with `underscored: true`.
  timestamps: true,
  tableName: 'categories',
  underscored: true,
});

export default Category;
