const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function checkTransactions() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'mysqlpassword',
      database: process.env.DB_NAME || 'dbemb',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('📊 Checking transactions table...\n');

    // Get total transaction count
    const [[countRow]] = await pool.execute('SELECT COUNT(*) as count FROM transactions');
    console.log(`Total transactions: ${countRow.count}\n`);

    // Get recent transactions
    const [transactions] = await pool.execute(
      `SELECT t.*, u.email, u.first_name, u.last_name, i.amount as invoice_amount
       FROM transactions t
       LEFT JOIN users u ON t.user_id = u.id
       LEFT JOIN invoices i ON t.invoice_id = i.invoice_id
       ORDER BY t.created_at DESC
       LIMIT 10`
    );

    if (transactions.length > 0) {
      console.log('Recent transactions:');
      console.log('='.repeat(100));
      transactions.forEach((tx, idx) => {
        console.log(`\n${idx + 1}. Transaction ID: ${tx.transaction_id}`);
        console.log(`   User: ${tx.first_name} ${tx.last_name} (${tx.email}) [ID: ${tx.user_id}]`);
        console.log(`   Invoice ID: ${tx.invoice_id || 'N/A'}`);
        console.log(`   Amount: ₱${tx.amount}`);
        console.log(`   Type: ${tx.transaction_type}`);
        console.log(`   Status: ${tx.status}`);
        console.log(`   Created: ${tx.created_at}`);
      });
    } else {
      console.log('❌ No transactions found in database!');
    }

    // Check for any payments without matching transactions
    const [orphanedPayments] = await pool.execute(
      `SELECT p.*, i.user_id
       FROM payments p
       LEFT JOIN invoices i ON p.invoice_id = i.invoice_id
       LEFT JOIN transactions t ON t.invoice_id = p.invoice_id AND t.transaction_type = 'payment'
       WHERE t.transaction_id IS NULL
       ORDER BY p.created_at DESC
       LIMIT 5`
    );

    if (orphanedPayments.length > 0) {
      console.log('\n\n⚠️  Payments without matching transactions:');
      console.log('='.repeat(100));
      orphanedPayments.forEach((p, idx) => {
        console.log(`\n${idx + 1}. Payment ID: ${p.payment_id}`);
        console.log(`   Invoice ID: ${p.invoice_id}`);
        console.log(`   User ID: ${p.user_id}`);
        console.log(`   Amount: ₱${p.amount_paid}`);
        console.log(`   Created: ${p.created_at}`);
      });
    }

    await pool.end();
  } catch (err) {
    console.error('❌ Error checking transactions:', err);
  }
}

checkTransactions();
