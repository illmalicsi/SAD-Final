const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function checkBilling() {
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

    console.log('📊 Checking billing tables...\n');

    // Check invoices
    const [[invoiceCount]] = await pool.execute('SELECT COUNT(*) as count FROM invoices');
    console.log(`📄 Total invoices: ${invoiceCount.count}`);
    
    if (invoiceCount.count > 0) {
      const [invoices] = await pool.execute('SELECT * FROM invoices ORDER BY created_at DESC LIMIT 5');
      console.log('Recent invoices:');
      invoices.forEach(inv => {
        console.log(`  - Invoice #${inv.invoice_id}: User ${inv.user_id}, Amount: $${inv.amount}, Status: ${inv.status}, Payment: ${inv.payment_status}`);
      });
    }
    console.log('');

    // Check payments
    const [[paymentCount]] = await pool.execute('SELECT COUNT(*) as count FROM payments');
    console.log(`💰 Total payments: ${paymentCount.count}`);
    
    if (paymentCount.count > 0) {
      const [payments] = await pool.execute('SELECT * FROM payments ORDER BY processed_at DESC LIMIT 5');
      console.log('Recent payments:');
      payments.forEach(pay => {
        console.log(`  - Payment #${pay.payment_id}: Invoice ${pay.invoice_id}, Amount: $${pay.amount_paid}, Method: ${pay.payment_method}, Date: ${pay.processed_at}`);
      });
    }
    console.log('');

    // Check transactions
    const [[transactionCount]] = await pool.execute('SELECT COUNT(*) as count FROM transactions');
    console.log(`🔄 Total transactions: ${transactionCount.count}`);
    
    if (transactionCount.count > 0) {
      const [transactions] = await pool.execute('SELECT * FROM transactions ORDER BY created_at DESC LIMIT 5');
      console.log('Recent transactions:');
      transactions.forEach(trans => {
        console.log(`  - Transaction #${trans.transaction_id}: User ${trans.user_id}, Invoice ${trans.invoice_id}, Amount: $${trans.amount}, Type: ${trans.transaction_type}, Status: ${trans.status}`);
      });
    } else {
      console.log('⚠️  No transactions found!');
      console.log('\nThis means:');
      console.log('1. No payments have been processed through the new system, OR');
      console.log('2. Payments were made before transaction logging was implemented');
      console.log('\nTo fix: Make a new payment to test transaction creation.');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBilling();
