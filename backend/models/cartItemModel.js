import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const CartItem = sequelize.define('CartItem', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_id',
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: 1 },
    },
}, {
    tableName: 'CartItems',
    indexes: [
        // Enforce one row per user+product at DB level
        { unique: true, fields: ['user_id', 'product_id'] },
        { fields: ['user_id'] },
    ],
});

export default CartItem;
