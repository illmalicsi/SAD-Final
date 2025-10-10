const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Database configuration - using same config as your main app
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'dbemb',
  port: process.env.DB_PORT || 3306
};

async function exportUsersToJson() {
  let connection;
  
  try {
    // Create database connection
    console.log('Connecting to MySQL database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected successfully!');

    // Query to get all users
    const [rows] = await connection.execute(`
      SELECT 
        u.id,
        u.first_name as firstName,
        u.last_name as lastName,
        u.email,
        r.role_name as role,
        u.is_active as isActive,
        u.is_blocked as isBlocked,
        u.created_at,
        u.updated_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      ORDER BY u.id
    `);

    // Convert to JSON format
    const usersData = {
      exportDate: new Date().toISOString(),
      totalUsers: rows.length,
      users: rows
    };

    // Create output file path
    const outputDir = path.join(__dirname, '..', 'exports');
    const outputFile = path.join(outputDir, `users_export_${new Date().toISOString().split('T')[0]}.json`);

    // Ensure exports directory exists
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // Write JSON file
    await fs.writeFile(outputFile, JSON.stringify(usersData, null, 2), 'utf8');
    
    console.log(`\n✅ Successfully exported ${rows.length} users to JSON!`);
    console.log(`📁 File saved: ${outputFile}`);
    console.log(`\n📊 Export Summary:`);
    console.log(`   Total Users: ${rows.length}`);
    console.log(`   Export Date: ${usersData.exportDate}`);
    
    // Display user count by role
    const roleStats = rows.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\n👥 Users by Role:`);
    Object.entries(roleStats).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });

    // Display blocked users count
    const blockedCount = rows.filter(user => user.isBlocked).length;
    console.log(`\n🚫 Blocked Users: ${blockedCount}`);

  } catch (error) {
    console.error('❌ Error exporting users:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tips:');
      console.log('   1. Make sure MySQL server is running');
      console.log('   2. Check your database connection settings in this script');
      console.log('   3. Verify your database credentials');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('\n💡 Tips:');
      console.log('   1. Make sure the "users" table exists in your database');
      console.log('   2. Check if you\'re connected to the correct database');
      console.log('   3. Run your database setup scripts first');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed.');
    }
  }
}

// Run the export
exportUsersToJson();