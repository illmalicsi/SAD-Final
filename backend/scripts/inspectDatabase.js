const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'dbemb',
  port: process.env.DB_PORT || 3306
};

async function inspectDatabase() {
  let connection;
  
  try {
    console.log('🔍 Inspecting database structure...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database:', dbConfig.database);

    // Check what tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📋 Available tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });

    // Check for users table specifically
    const userTableExists = tables.some(table => 
      Object.values(table)[0].toLowerCase().includes('user')
    );

    if (userTableExists) {
      // Find the actual users table name
      const usersTable = tables.find(table => 
        Object.values(table)[0].toLowerCase().includes('user')
      );
      const tableName = Object.values(usersTable)[0];
      
      console.log(`\n🔍 Inspecting '${tableName}' table structure:`);
      const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
      
      console.log('\n📊 Column details:');
      columns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? '- Required' : '- Optional'}`);
      });

      // Show sample data
      console.log(`\n📄 Sample data from '${tableName}':`);
      const [sampleData] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 3`);
      console.log(JSON.stringify(sampleData, null, 2));

    } else {
      console.log('\n⚠️  No users table found. Available tables:');
      tables.forEach(table => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
    }

  } catch (error) {
    console.error('❌ Error inspecting database:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

inspectDatabase();