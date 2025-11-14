require('dotenv').config();
const { pool } = require('../config/database');

const emails = process.argv.slice(2);
if (!emails.length) {
  console.error('Usage: node find_rent_request_by_email.js <email1> [email2] ...');
  process.exit(1);
}

async function find() {
  try {
    const placeholders = emails.map(() => '?').join(',');
    const sql = `
      SELECT rr.request_id, rr.user_id, u.email AS user_email, rr.instrument_id, rr.status, rr.start_date, rr.request_date
      FROM rent_requests rr
      LEFT JOIN users u ON rr.user_id = u.id
      WHERE u.email IN (${placeholders})
      ORDER BY rr.request_date DESC
    `;
    const [rows] = await pool.query(sql, emails);
    if (!rows.length) {
      console.log('No matching rent_requests found for:', emails.join(', '));
    } else {
      console.log(`Found ${rows.length} matching rent_requests:`);
      rows.forEach(r => {
        console.log(`- request_id=${r.request_id} user_id=${r.user_id} email=${r.user_email} instrument_id=${r.instrument_id} status=${r.status} start_date=${r.start_date} created_at=${r.request_date}`);
      });
    }
  } catch (err) {
    console.error('Error querying rent_requests by email:', err.message);
  } finally {
    pool.end();
  }
}

find();
