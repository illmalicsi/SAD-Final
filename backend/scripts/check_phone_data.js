const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'dbemb',
  port: process.env.DB_PORT || 3306
});

async function checkPhoneData() {
  try {
    console.log('Checking phone data in requests...\n');
    
    const [rentRequests] = await pool.query('SELECT request_id, user_id, instrument_name, phone FROM rent_requests ORDER BY request_id DESC LIMIT 5');
    console.log('Recent Rent Requests:');
    rentRequests.forEach(r => {
      console.log(`  ID: ${r.request_id}, Phone: ${r.phone || 'NULL'}, Instrument: ${r.instrument_name}`);
    });
    
    console.log('\n');
    
    const [borrowRequests] = await pool.query('SELECT request_id, user_id, instrument_name, phone FROM borrow_requests ORDER BY request_id DESC LIMIT 5');
    console.log('Recent Borrow Requests:');
    borrowRequests.forEach(r => {
      console.log(`  ID: ${r.request_id}, Phone: ${r.phone || 'NULL'}, Instrument: ${r.instrument_name}`);
    });
    
    console.log('\n');
    
    // Check if phone column exists
    const [rentColumns] = await pool.query("SHOW COLUMNS FROM rent_requests LIKE 'phone'");
    const [borrowColumns] = await pool.query("SHOW COLUMNS FROM borrow_requests LIKE 'phone'");
    
    console.log('Phone column in rent_requests:', rentColumns.length > 0 ? 'EXISTS' : 'MISSING');
    console.log('Phone column in borrow_requests:', borrowColumns.length > 0 ? 'EXISTS' : 'MISSING');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPhoneData();
