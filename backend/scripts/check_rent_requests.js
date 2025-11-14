require('dotenv').config();
const { pool } = require('../config/database');

async function check() {
  try {
    const [rows] = await pool.query('SELECT * FROM rent_requests ORDER BY request_id DESC LIMIT 20');
    console.log(`Found ${rows.length} recent rent_requests:`);
    rows.forEach(r => {
      console.log(`- request_id=${r.request_id} user_id=${r.user_id} instrument_id=${r.instrument_id} status=${r.status} start_date=${r.start_date} created_at=${r.request_date}`);
    });
  } catch (err) {
    console.error('Error querying rent_requests:', err.message);
  } finally {
    pool.end();
  }
}

check();
