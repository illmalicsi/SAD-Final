const { pool, testConnection } = require('../config/database');
const billingService = require('../services/billingService');
const bcrypt = require('bcryptjs');

async function main() {
  const ok = await testConnection();
  if (!ok) {
    console.error('DB connection failed; aborting test');
    process.exit(1);
  }

  // 1) Find any existing user
  let userId = null;
  try {
    const [rows] = await pool.execute('SELECT id FROM users LIMIT 1');
    if (rows && rows.length > 0) {
      userId = rows[0].id;
      console.log('Using existing user id:', userId);
    }
  } catch (e) {
    console.error('Error selecting user:', e.message);
  }

  // 2) If no user exists, create a temp user
  if (!userId) {
    try {
      const passwordHash = await bcrypt.hash('password123', 10);
      const [ins] = await pool.execute(
        `INSERT INTO users (first_name, last_name, email, password_hash, role_id, is_active, is_blocked, created_at)
         VALUES (?, ?, ?, ?, ?, 1, 0, NOW())`,
        ['Test', 'User', 'simulate-test@example.com', passwordHash, 3]
      );
      userId = ins.insertId;
      console.log('Created test user id:', userId);
    } catch (e) {
      console.error('Failed to create test user:', e.message);
      process.exit(1);
    }
  }

  // 3) Insert invoice with amount = 0
  let invoiceId;
  try {
    const [res] = await pool.execute(
      `INSERT INTO invoices (user_id, amount, description, status, payment_status, created_at) VALUES (?, ?, ?, 'approved', 'unpaid', NOW())`,
      [userId, 0.00, 'Simulate zero-amount invoice']
    );
    invoiceId = res.insertId;
    console.log('Inserted test invoice id:', invoiceId);
  } catch (e) {
    console.error('Failed to insert invoice:', e.message);
    process.exit(1);
  }

  // 4) Call processPayment to insert a payment and trigger repair/backfill
  try {
    console.log('Calling processPayment for invoice', invoiceId, 'amount 375.00');
    const payment = await billingService.processPayment(invoiceId, userId, 375.00, 'cash', 'Simulated payment for repair test');
    console.log('processPayment returned:', payment);
  } catch (e) {
    console.error('Error in processPayment:', e && e.message ? e.message : e);
  }

  // 5) Show resulting invoice and payments
  try {
    const [[inv]] = await pool.execute('SELECT * FROM invoices WHERE invoice_id = ?', [invoiceId]);
    console.log('Invoice row after payment:', inv);
    const [pays] = await pool.execute('SELECT * FROM payments WHERE invoice_id = ?', [invoiceId]);
    console.log('Payments for invoice:', pays);
  } catch (e) {
    console.error('Error fetching invoice/payments:', e.message);
  }

  console.log('Test complete. You may want to cleanup the test rows.');
  process.exit(0);
}

main();
