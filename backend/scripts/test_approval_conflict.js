const { pool } = require('../config/database');

async function run() {
  const date = '2025-11-29';
  // Booking A: Ivan 08:00-12:00 (approved)
  // Booking B: Tyrian 09:00-14:00 (pending)
  try {
    console.log('Inserting test bookings...');
    const [resA] = await pool.query(
      `INSERT INTO bookings (customer_name, email, phone, service, date, start_time, end_time, location, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      ['Ivan', 'ivan@example.test', '09170000001', 'Band Gig', date, '08:00:00', '12:00:00', 'Bangkal', 'approved']
    );
    const idA = resA.insertId;

    const [resB] = await pool.query(
      `INSERT INTO bookings (customer_name, email, phone, service, date, start_time, end_time, location, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      ['Tyrian', 'tyrian@example.test', '09170000002', 'Band Parade', date, '09:00:00', '14:00:00', 'Roxas', 'pending']
    );
    const idB = resB.insertId;

    console.log('Inserted booking ids:', idA, idB);

    // Run the approval conflict check (same logic as in bookings.js)
    console.log('Running conflict query for approving booking B...');
    const [conflicts] = await pool.query(
      `SELECT booking_id, customer_name, service, start_time, end_time, status, date
       FROM bookings
       WHERE date = ?
         AND status = 'approved'
         AND NOT (end_time <= ? OR start_time >= ?)
         AND booking_id != ?
      `,
      [date, '09:00:00', '14:00:00', idB]
    );

    console.log('Conflicts found count:', conflicts.length);
    console.log(conflicts);

    // Clean up
    console.log('Cleaning up test rows...');
    await pool.query('DELETE FROM bookings WHERE booking_id IN (?, ?)', [idA, idB]);
    console.log('Done.');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  } finally {
    try { await pool.end(); } catch (e) { /* ignore */ }
  }
}

run();
