const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function checkUser1Role() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'mysqlpassword',
      database: process.env.DB_NAME || 'dbemb',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('👤 Checking user 1 details...\n');

    const [[user]] = await pool.execute('SELECT id, name, email, role FROM users WHERE id = 1');
    
    if (user) {
      console.log(`User ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log('');
      
      if (user.role === 'admin') {
        console.log('✅ User 1 IS an admin - should see all transactions');
      } else {
        console.log('❌ User 1 is NOT an admin - will only see their own transactions');
        console.log('\nTo make user 1 an admin, run:');
        console.log('UPDATE users SET role = "admin" WHERE id = 1;');
      }
    } else {
      console.log('❌ User 1 not found');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUser1Role();
