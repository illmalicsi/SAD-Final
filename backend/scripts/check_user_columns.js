const { pool } = require('../config/database');

async function checkColumns() {
  try {
    console.log('Checking users table structure...\n');
    
    // Get table structure
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'dbemb' AND TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Columns in users table:');
    columns.forEach(col => {
      console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE} (default: ${col.COLUMN_DEFAULT}, nullable: ${col.IS_NULLABLE})`);
    });
    
    // Check if is_active and is_blocked exist
    const hasIsActive = columns.find(c => c.COLUMN_NAME === 'is_active');
    const hasIsBlocked = columns.find(c => c.COLUMN_NAME === 'is_blocked');
    
    console.log('\n=== Status Check ===');
    console.log('is_active column exists:', !!hasIsActive);
    console.log('is_blocked column exists:', !!hasIsBlocked);
    
    if (!hasIsActive || !hasIsBlocked) {
      console.log('\n⚠️ WARNING: Missing columns! You need to add them.');
      console.log('\nRun this SQL:');
      console.log('ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;');
      console.log('ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE;');
    } else {
      // Check actual data
      console.log('\n=== Sample User Data ===');
      const [users] = await pool.execute('SELECT id, email, is_active, is_blocked FROM users LIMIT 5');
      users.forEach(u => {
        console.log(`ID ${u.id} (${u.email}): active=${u.is_active}, blocked=${u.is_blocked}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkColumns();
