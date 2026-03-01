import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AuditLog = sequelize.define('AuditLog', {
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  resourceType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  resourceId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  changes: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  indexes: [
    { fields: ['adminId'] },
    { fields: ['createdAt'] },
    { fields: ['resourceType'] }
  ],
  updatedAt: false // Audit logs should not be updated
});

export default AuditLog;
