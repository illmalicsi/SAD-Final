// Ensure we load backend .env when running this script from repo root
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { pool } = require('../config/database');

(async () => {
  try {
    const normalizedEmail = 'test-cli@example.com';
    const payloadData = JSON.stringify({ requestId: 999 });
    const [result] = await pool.query(
      `INSERT INTO notifications (user_email, type, title, message, data, delivered_at, created_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [normalizedEmail, 'info', 'CLI Test', 'Inserted from CLI test', payloadData]
    );
    console.log('Insert result:', result);
    const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
    console.log('Inserted row:', rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('Test insert failed:', err);
    process.exit(1);
  }
})();
