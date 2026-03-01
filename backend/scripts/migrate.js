import { sequelize, Product, Category, User, Order, Review, AuditLog } from '../models/index.js';

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Create new tables only (Reviews and AuditLogs)
    // Use force: false to avoid dropping existing tables
    await Review.sync({ alter: false });
    console.log('✅ Reviews table created');
    
    await AuditLog.sync({ alter: false });
    console.log('✅ AuditLogs table created');
    
    // Add new columns to existing tables using raw SQL
    const queryInterface = sequelize.getQueryInterface();
    
    // Add averageRating and totalReviews to Products if they don't exist
    try {
      await queryInterface.addColumn('Products', 'averageRating', {
        type: 'DECIMAL(3, 2)',
        defaultValue: 0
      });
      console.log('✅ Added averageRating column to Products');
    } catch (error) {
      if (error.original?.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  averageRating column already exists in Products');
      } else {
        throw error;
      }
    }
    
    try {
      await queryInterface.addColumn('Products', 'totalReviews', {
        type: 'INTEGER',
        defaultValue: 0
      });
      console.log('✅ Added totalReviews column to Products');
    } catch (error) {
      if (error.original?.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  totalReviews column already exists in Products');
      } else {
        throw error;
      }
    }
    
    // Add status column to Orders if it doesn't exist
    try {
      await queryInterface.addColumn('Orders', 'status', {
        type: "ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'failed')",
        defaultValue: 'pending'
      });
      console.log('✅ Added status column to Orders');
    } catch (error) {
      if (error.original?.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  status column already exists in Orders');
      } else {
        throw error;
      }
    }
    
    // Add indexes using raw SQL to avoid conflicts
    const addIndexSafely = async (tableName, indexName, columns) => {
      try {
        await sequelize.query(`CREATE INDEX ${indexName} ON ${tableName} (${columns})`);
        console.log(`✅ Created index ${indexName} on ${tableName}`);
      } catch (error) {
        if (error.original?.code === 'ER_DUP_KEYNAME') {
          console.log(`ℹ️  Index ${indexName} already exists on ${tableName}`);
        } else {
          throw error;
        }
      }
    };
    
    // Add indexes to existing tables
    await addIndexSafely('Orders', 'idx_orders_userId', 'userId');
    await addIndexSafely('Orders', 'idx_orders_status', 'status');
    await addIndexSafely('Orders', 'idx_orders_createdAt', 'createdAt');
    await addIndexSafely('Products', 'idx_products_stock', 'stock');
    await addIndexSafely('Products', 'idx_products_averageRating', 'averageRating');
    
    console.log('✅ Database migration completed successfully');
    console.log('📋 Summary:');
    console.log('  - Users table: email already has unique index');
    console.log('  - Products table: added averageRating, totalReviews columns and indexes');
    console.log('  - Orders table: added status column and indexes');
    console.log('  - Reviews table: created with indexes');
    console.log('  - AuditLogs table: created with indexes');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
