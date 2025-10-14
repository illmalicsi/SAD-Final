const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function runMigration() {
  let connection;
  
  try {
    // Get connection from pool
    connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', '..', 'database', 'bookings_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Running bookings_table.sql migration...');
    
    // Split SQL statements and execute separately
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
    
    console.log('✅ Bookings table migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
      console.log('🔌 Database connection closed');
    }
    await pool.end();
    process.exit(0);
  }
}

runMigration();
