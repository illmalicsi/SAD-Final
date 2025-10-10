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

async function exportAllUsersToJson() {
  let connection;
  
  try {
    console.log('Connecting to MySQL database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected successfully!');

    const exportData = {
      exportDate: new Date().toISOString(),
      databaseName: dbConfig.database,
      exports: {}
    };

    // 1. Export application users from your users table
    try {
      const [appUsers] = await connection.execute(`
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

      exportData.exports.applicationUsers = {
        count: appUsers.length,
        data: appUsers
      };

      console.log(`📱 Found ${appUsers.length} application users`);
    } catch (error) {
      console.log('⚠️  Could not fetch application users:', error.message);
      exportData.exports.applicationUsers = { error: error.message };
    }

    // 2. Export MySQL system users (requires appropriate privileges)
    try {
      const [mysqlUsers] = await connection.execute(`
        SELECT 
          User,
          Host,
          authentication_string,
          plugin,
          password_expired,
          password_last_changed,
          password_lifetime,
          account_locked,
          Create_user_priv,
          Drop_role_priv,
          Create_role_priv,
          Super_priv
        FROM mysql.user 
        ORDER BY User, Host
      `);

      exportData.exports.mysqlSystemUsers = {
        count: mysqlUsers.length,
        data: mysqlUsers
      };

      console.log(`🔐 Found ${mysqlUsers.length} MySQL system users`);
    } catch (error) {
      console.log('⚠️  Could not fetch MySQL system users:', error.message);
      exportData.exports.mysqlSystemUsers = { error: error.message };
    }

    // 3. Export user privileges (if accessible)
    try {
      const [privileges] = await connection.execute(`
        SELECT 
          GRANTEE,
          TABLE_CATALOG,
          TABLE_SCHEMA,
          TABLE_NAME,
          PRIVILEGE_TYPE,
          IS_GRANTABLE
        FROM information_schema.TABLE_PRIVILEGES 
        WHERE GRANTEE LIKE '%@%'
        ORDER BY GRANTEE, TABLE_SCHEMA, TABLE_NAME
      `);

      exportData.exports.userPrivileges = {
        count: privileges.length,
        data: privileges
      };

      console.log(`🛡️  Found ${privileges.length} privilege records`);
    } catch (error) {
      console.log('⚠️  Could not fetch user privileges:', error.message);
      exportData.exports.userPrivileges = { error: error.message };
    }

    // Create output file
    const outputDir = path.join(__dirname, '..', 'exports');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const outputFile = path.join(outputDir, `complete_users_export_${timestamp}.json`);

    // Ensure exports directory exists
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // Write JSON file with pretty formatting
    await fs.writeFile(outputFile, JSON.stringify(exportData, null, 2), 'utf8');
    
    console.log(`\n✅ Complete user export finished!`);
    console.log(`📁 File saved: ${outputFile}`);
    console.log(`\n📊 Export Summary:`);
    
    Object.entries(exportData.exports).forEach(([exportType, data]) => {
      if (data.error) {
        console.log(`   ${exportType}: ❌ Error - ${data.error}`);
      } else {
        console.log(`   ${exportType}: ✅ ${data.count} records`);
      }
    });

  } catch (error) {
    console.error('❌ Error during export:', error.message);
    
    console.log('\n💡 Troubleshooting Tips:');
    console.log('   1. Make sure MySQL server is running');
    console.log('   2. Check database connection settings');
    console.log('   3. Verify your MySQL user has appropriate privileges');
    console.log('   4. For system users, you need SELECT privilege on mysql.user table');
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed.');
    }
  }
}

// Run the export
exportAllUsersToJson();