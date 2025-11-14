require('dotenv').config();
const { pool } = require('../config/database');

async function check() {
  try {
    const [rows] = await pool.query(`
      SELECT rr.request_id, rr.user_id, u.email AS user_email, rr.instrument_id, rr.status, rr.start_date, rr.request_date
      FROM rent_requests rr
      LEFT JOIN users u ON rr.user_id = u.id
      ORDER BY rr.request_id DESC
      LIMIT 20
    `);
    console.log(`Found ${rows.length} recent rent_requests (with user emails):`);
    rows.forEach(r => {
      console.log(`- request_id=${r.request_id} user_id=${r.user_id} email=${r.user_email} instrument_id=${r.instrument_id} status=${r.status} start_date=${r.start_date} created_at=${r.request_date}`);
    });
  } catch (err) {
    console.error('Error querying rent_requests:', err.message);
  } finally {
    pool.end();
  }
}

check();
