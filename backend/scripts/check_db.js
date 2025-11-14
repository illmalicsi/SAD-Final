// check_db.js
// Run from backend folder: node scripts/check_db.js
// This script reads backend/.env (via dotenv) and connects to MySQL using mysql2/promise.
// It prints database/table existence, instruments describe, counts and sample rows.

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

(async () => {
  const cfg = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dbemb',
    port: Number(process.env.DB_PORT || 3306),
    connectTimeout: 5000
  };

  console.log('Using DB config:', { host: cfg.host, user: cfg.user, database: cfg.database, port: cfg.port });

  let conn;
  try {
    conn = await mysql.createConnection(cfg);
  } catch (err) {
    console.error('Failed to connect to MySQL:', err.message);
    process.exit(2);
  }

  try {
    console.log('\n1) SHOW DATABASES LIKE "dbemb" (or configured DB):');
    const [dbs] = await conn.query("SHOW DATABASES LIKE ?", [cfg.database]);
    console.log(dbs);

    console.log('\n2) SHOW TABLES in', cfg.database);
    const [tables] = await conn.query('SHOW TABLES');
    console.log(tables.slice(0, 50));

    console.log('\n3) Does instruments table exist? DESCRIBE instruments');
    try {
      const [desc] = await conn.query('DESCRIBE instruments');
      console.log(desc);
    } catch (err) {
      console.error('DESCRIBE failed:', err.message);
    }

  console.log('\n4) Counts: total & with_price');
    try {
      const [rows] = await conn.query("SELECT COUNT(*) AS total_instruments, SUM(price_per_day IS NOT NULL) AS with_price, SUM(price_per_day IS NULL) AS without_price FROM instruments");
      console.log(rows);
    } catch (err) {
      console.error('Count query failed:', err.message);
    }

    console.log('\n5) Sample 20 instruments: instrument_id, name, price_per_day, condition_status, availability_status');
    try {
      const [sample] = await conn.query('SELECT instrument_id, name, price_per_day, condition_status, availability_status FROM instruments ORDER BY instrument_id LIMIT 20');
      console.log(sample);
    } catch (err) {
      console.error('Sample query failed:', err.message);
    }

  } finally {
    if (conn) await conn.end();
  }

  console.log('\nDone. Paste the output here and I will interpret it.');
})();
