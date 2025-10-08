const { pool } = require('../config/database');

// Generate a new invoice
async function generateInvoice(userId, amount, description) {
  const [result] = await pool.execute(
    `INSERT INTO invoices (user_id, amount, description) VALUES (?, ?, ?)`,
    [userId, amount, description]
  );
  const invoiceId = result.insertId;
  const [rows] = await pool.execute(
    `SELECT * FROM invoices WHERE invoice_id = ?`,
    [invoiceId]
  );
  return rows[0];
}

// Approve an existing invoice
async function approveInvoice(invoiceId) {
  const [result] = await pool.execute(
    `UPDATE invoices SET status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE invoice_id = ?`,
    [invoiceId]
  );
  return result.affectedRows > 0;
}

// Process payment for an invoice
async function processPayment(invoiceId, processedBy, amountPaid) {
  // Insert payment record
  const [payRes] = await pool.execute(
    `INSERT INTO payments (invoice_id, amount_paid, processed_by) VALUES (?, ?, ?)`,
    [invoiceId, amountPaid, processedBy]
  );

  // Update invoice status to paid
  await pool.execute(
    `UPDATE invoices SET status = 'paid' WHERE invoice_id = ?`,
    [invoiceId]
  );

  // Insert transaction record
  await pool.execute(
    `INSERT INTO transactions (user_id, invoice_id, amount, transaction_type, status) VALUES (
      (SELECT user_id FROM invoices WHERE invoice_id = ?),
      ?, ?, 'payment', 'completed'
    )`,
    [invoiceId, invoiceId, amountPaid]
  );

  const [paymentRows] = await pool.execute(
    `SELECT * FROM payments WHERE payment_id = ?`,
    [payRes.insertId]
  );
  return paymentRows[0];
}

// Get transactions for a user
async function getUserTransactions(userId) {
  const [rows] = await pool.execute(
    `SELECT t.*, i.amount AS invoice_amount, i.status AS invoice_status
       FROM transactions t
       LEFT JOIN invoices i ON t.invoice_id = i.invoice_id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC`,
    [userId]
  );
  return rows;
}

// Get all invoices (admin view)
async function getAllInvoices() {
  const [rows] = await pool.execute(
    `SELECT * FROM invoices ORDER BY created_at DESC`
  );
  return rows;
}

module.exports = {
  generateInvoice,
  approveInvoice,
  processPayment,
  getUserTransactions,
  getAllInvoices
};