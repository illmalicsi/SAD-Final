const fs = require('fs');
const path = require('path');
const { pool, testConnection } = require('../config/database');

async function writeJson(filename, data) {
  const out = path.resolve(__dirname, '..', 'exports', filename);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(data, null, 2));
  console.log(`Wrote ${Array.isArray(data) ? data.length : 1} items to ${out}`);
}

async function fetchStats() {
  const [[totals]] = await pool.execute(
    `SELECT COUNT(*) AS total_invoices, COALESCE(SUM(amount),0) AS total_revenue FROM invoices`
  );
  const [statusRows] = await pool.execute(
    `SELECT status, COUNT(*) AS cnt FROM invoices GROUP BY status`
  );
  const [[paidRow]] = await pool.execute(
    `SELECT COUNT(*) AS paid_count FROM invoices WHERE status IN ('paid','approved')`
  );
  return { totals, per_status: statusRows, paid_count: paidRow.paid_count };
}

async function fetchRecentInvoices(limit = 50) {
  const [rows] = await pool.execute(
    `SELECT invoice_id, invoice_number, user_id, amount, status, payment_status, issue_date, created_at
     FROM invoices ORDER BY created_at DESC LIMIT ?`,
    [limit]
  );
  return rows;
}

async function fetchRecentPayments(limit = 50) {
  const [rows] = await pool.execute(
    `SELECT payment_id, invoice_id, amount_paid, payment_method, processed_by, processed_at, notes
     FROM payments ORDER BY processed_at DESC LIMIT ?`,
    [limit]
  );
  return rows;
}

async function fetchExpenses(limit = 50) {
  const [rows] = await pool.execute(
    `SELECT * FROM expenses ORDER BY incurred_at DESC LIMIT ?`,
    [limit]
  );
  return rows;
}

async function main() {
  const ok = await testConnection();
  if (!ok) process.exit(1);

  try {
    console.log('Fetching stats...');
    const stats = await fetchStats();
    console.log('Stats:', stats.totals, 'paid_count=', stats.paid_count);
    await writeJson('stats.json', stats);

    console.log('Fetching recent invoices...');
    const invoices = await fetchRecentInvoices(100);
    await writeJson('invoices_recent.json', invoices);

    console.log('Fetching recent payments...');
    const payments = await fetchRecentPayments(100);
    await writeJson('payments_recent.json', payments);

    console.log('Fetching recent expenses...');
    const expenses = await fetchExpenses(100);
    await writeJson('expenses_recent.json', expenses);

    console.log('\nSummary:');
    console.log(`Total invoices: ${stats.totals.total_invoices}  Total revenue: ₱${Number(stats.totals.total_revenue||0).toLocaleString()}`);
    console.log(`Per-status:`, stats.per_status);
    console.log(`Paid/Approved count: ${stats.paid_count}`);

    console.log('\nExports written to backend/exports/*.json');
  } catch (err) {
    console.error('Export failed:', err && err.stack ? err.stack : err);
    process.exit(2);
  } finally {
    try { await pool.end(); } catch (e) {}
  }
}

main();
