const { pool } = require('../config/database');

async function checkPrices() {
  try {
    const [rows] = await pool.query(
      'SELECT instrument_id, name, price_per_day FROM instruments WHERE price_per_day IS NULL OR price_per_day = 0 ORDER BY name'
    );
    
    console.log(`\nFound ${rows.length} instruments without prices:\n`);
    rows.forEach(r => {
      console.log(`ID ${r.instrument_id}: ${r.name} - price_per_day: ${r.price_per_day}`);
    });
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkPrices();
