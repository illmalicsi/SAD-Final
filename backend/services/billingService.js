// Get invoices for a specific user
async function getInvoicesByUser(userId) {
  const [rows] = await pool.execute(
    `SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}
const { pool } = require('../config/database');

// Generate a new invoice
async function generateInvoice(userId, amount, description) {
  // Insert minimal row first, then set a human-friendly invoice_number using the insertId
  const [result] = await pool.execute(
    `INSERT INTO invoices (user_id, amount, description, status, payment_status) VALUES (?, ?, ?, 'pending', 'unpaid')`,
    [userId, amount, description]
  );
  const invoiceId = result.insertId;

  // Generate invoice number (e.g., INV-20251027-000123)
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const invoiceNumber = `INV-${y}${m}${d}-${String(invoiceId).padStart(6, '0')}`;

  await pool.execute(
    `UPDATE invoices SET invoice_number = ?, issue_date = NOW() WHERE invoice_id = ?`,
    [invoiceNumber, invoiceId]
  );

  const [rows] = await pool.execute(
    `SELECT * FROM invoices WHERE invoice_id = ?`,
    [invoiceId]
  );
  return rows[0];
}

// Record an expense
async function addExpense(amount, category, description, incurredBy = null) {
  const [result] = await pool.execute(
    `INSERT INTO expenses (amount, category, description, incurred_by) VALUES (?, ?, ?, ?)`,
    [amount, category, description, incurredBy]
  );
  const expenseId = result.insertId;
  const [rows] = await pool.execute(`SELECT * FROM expenses WHERE expense_id = ?`, [expenseId]);
  return rows[0];
}

// Get expenses (admin view) with optional date range
async function getExpenses(fromDate = null, toDate = null) {
  if (fromDate && toDate) {
    const [rows] = await pool.execute(`SELECT * FROM expenses WHERE DATE(incurred_at) BETWEEN ? AND ? ORDER BY incurred_at DESC`, [fromDate, toDate]);
    return rows;
  }
  const [rows] = await pool.execute(`SELECT * FROM expenses ORDER BY incurred_at DESC`);
  return rows;
}

// Generate a simple financial report (income, expenses, profit) for a date range
async function getFinancialReport(fromDate = null, toDate = null) {
  // Income: sum of invoice amounts (approved/paid) within date range
  let incomeQuery = `SELECT COALESCE(SUM(amount),0) AS total_income FROM invoices WHERE status IN ('approved','paid')`;
  let expenseQuery = `SELECT COALESCE(SUM(amount),0) AS total_expenses FROM expenses`;
  const params = [];
  const params2 = [];
  if (fromDate && toDate) {
    incomeQuery += ' AND DATE(issue_date) BETWEEN ? AND ?';
    expenseQuery += ' WHERE DATE(incurred_at) BETWEEN ? AND ?';
    params.push(fromDate, toDate);
    params2.push(fromDate, toDate);
  }
  const [[inc]] = await pool.execute(incomeQuery, params);
  const [[exp]] = await pool.execute(expenseQuery, params2);
  const income = Number(inc?.total_income || 0);
  const expenses = Number(exp?.total_expenses || 0);
  const profit = income - expenses;
  return { income, expenses, profit, fromDate, toDate };
}

// Approve an existing invoice
async function approveInvoice(invoiceId) {
  const [result] = await pool.execute(
    `UPDATE invoices SET status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE invoice_id = ?`,
    [invoiceId]
  );
  return result.affectedRows > 0;
}

// Process payment for an invoice (supports partial payments)
async function processPayment(invoiceId, processedBy, amountPaid, paymentMethod = 'cash') {
  // Insert payment record (with method)
  const [payRes] = await pool.execute(
    `INSERT INTO payments (invoice_id, amount_paid, payment_method, processed_by) VALUES (?, ?, ?, ?)`,
    [invoiceId, amountPaid, paymentMethod, processedBy]
  );

  // Compute total paid vs invoice amount
  // Compute invoice amount and total paid using a subquery to avoid GROUP BY issues
  const [[sumRow]] = await pool.execute(
    `SELECT i.amount AS invoice_amount,
            COALESCE((SELECT SUM(p.amount_paid) FROM payments p WHERE p.invoice_id = i.invoice_id), 0) AS total_paid
       FROM invoices i
      WHERE i.invoice_id = ?`,
    [invoiceId]
  );

  const invoiceAmount = Number(sumRow?.invoice_amount || 0);
  const totalPaid = Number(sumRow?.total_paid || 0);

  // Mark invoice paid only when fully covered
  if (totalPaid >= invoiceAmount && invoiceAmount > 0) {
    await pool.execute(
      `UPDATE invoices SET status = 'paid' WHERE invoice_id = ?`,
      [invoiceId]
    );
  }

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
  // Return payment plus updated totals
  return { ...paymentRows[0], total_paid: totalPaid, invoice_amount: invoiceAmount };
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
  getAllInvoices,
  getInvoicesByUser
};