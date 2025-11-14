/*
  Node backfill script: safer approach that reads transactions with NULL payment_method,
  infers method via regex, logs changes, and updates rows using a prepared statement.

  Usage (from project root):
    cd backend
    npm install mysql2
    node scripts/backfill_transactions_payment_method.js

  WARNING: Run on a DB backup or staging DB first.
*/

const mysql = require('mysql2/promise');

const infer = (desc) => {
  if (!desc) return null;
  const d = desc.toLowerCase();
  if (/gcash|g-cash|g cash/.test(d)) return 'gcash';
  if (/visa|mastercard|amex|credit|debit|card/.test(d)) return 'card';
  if (/paypal|stripe|online payment|online/.test(d)) return 'online';
  if (/bank transfer|bank_transfer|bank\b|bdo|landbank|unibank|metrobank/.test(d)) return 'bank_transfer';
  if (/cash|paid in cash|payment received: cash/.test(d)) return 'cash';
  return null;
};

(async function(){
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'dbemb',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT,10) : 3306,
  };

  console.log('Connecting to DB', config.host, config.database);
  const conn = await mysql.createConnection(config);
  try {
    // Fetch candidate rows
    const [rows] = await conn.execute(
      `SELECT transaction_id, description FROM transactions WHERE payment_method IS NULL OR payment_method = '' LIMIT 10000`);

    console.log('Found', rows.length, 'candidate transactions');
    let updated = 0;
    const updateStmt = `UPDATE transactions SET payment_method = ? WHERE transaction_id = ?`;

    for (const r of rows) {
      const inferred = infer(r.description);
      if (inferred) {
        await conn.execute(updateStmt, [inferred, r.transaction_id]);
        console.log('Updated', r.transaction_id, '->', inferred);
        updated++;
      } else {
        console.log('Skipped', r.transaction_id, '(no inference)');
      }
    }

    console.log('Done. Updated', updated, 'rows.');
  } catch (err) {
    console.error('Error during backfill:', err);
  } finally {
    await conn.end();
  }
})();
