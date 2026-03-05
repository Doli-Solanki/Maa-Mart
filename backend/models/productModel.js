import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// const Product = sequelize.define('Product', {
//   name: { type: DataTypes.STRING },
//   price: { type: DataTypes.FLOAT },
//   category: { type: DataTypes.STRING },
//   stock: { type: DataTypes.INTEGER, defaultValue: 0 },
//   image: { type: DataTypes.STRING },
//   description: { type: DataTypes.TEXT }
// });
const Product = sequelize.define("Product", {
  name: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.FLOAT },
  stock: { type: DataTypes.INTEGER },
  image: { type: DataTypes.STRING },
  // Use a DB column named `category_id` while keeping the JS attribute `categoryId`
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "category_id",
    references: {
      model: "categories", // table name from Category model options
      key: "id",
    },
  },
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: "products",   // ⭐ IMPORTANT FIX
    timestamps: true,  
  indexes: [
    { fields: ['category_id'] },
    { fields: ['stock'] },
    { fields: ['averageRating'] }
  ]
});

export default Product;
