const { pool } = require('../config/database');

async function detect() {
  try {
    const result = {};

    // Check for table existence
    const [[invTable]] = await pool.query("SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'instrument_inventory'");
    const invExists = Number(invTable.cnt || 0) > 0;
    result.instrument_inventory_exists = invExists;

    const [[itemsTable]] = await pool.query("SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'instrument_items'");
    const itemsExists = Number(itemsTable.cnt || 0) > 0;
    result.instrument_items_exists = itemsExists;

    // Row counts (if tables exist)
    if (invExists) {
      const [[invCount]] = await pool.query('SELECT COUNT(*) AS cnt FROM instrument_inventory');
      result.instrument_inventory_rows = Number(invCount.cnt || 0);
    } else {
      result.instrument_inventory_rows = 0;
    }

    if (itemsExists) {
      const [[itemsCount]] = await pool.query("SELECT COUNT(*) AS cnt FROM instrument_items");
      result.instrument_items_rows = Number(itemsCount.cnt || 0);

      // Count available items per instrument (top 10)
      const [availByInstrument] = await pool.query(`
        SELECT instrument_id, COUNT(*) AS available_items
        FROM instrument_items
        WHERE is_active = TRUE AND status = 'Available'
        GROUP BY instrument_id
        ORDER BY available_items DESC
        LIMIT 10
      `);
      result.available_items_sample = availByInstrument;
    } else {
      result.instrument_items_rows = 0;
      result.available_items_sample = [];
    }

    // Instruments quantity column usage
    const [[instQtyCount]] = await pool.query("SELECT COUNT(*) AS cnt FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'instruments' AND column_name = 'quantity'");
    const instHasQuantity = Number(instQtyCount.cnt || 0) > 0;
    result.instruments_has_quantity_column = instHasQuantity;

    if (instHasQuantity) {
      const [[qtyNonZero]] = await pool.query('SELECT COUNT(*) AS cnt FROM instruments WHERE COALESCE(quantity,0) > 0');
      result.instruments_with_nonzero_quantity = Number(qtyNonZero.cnt || 0);
    } else {
      result.instruments_with_nonzero_quantity = 0;
    }

    // Check for legacy triggers that may reintroduce 'Reserved'
    const [trigs] = await pool.query("SELECT TRIGGER_NAME, EVENT_MANIPULATION, ACTION_STATEMENT FROM information_schema.triggers WHERE TRIGGER_SCHEMA = DATABASE() AND (TRIGGER_NAME LIKE '%reserve%' OR TRIGGER_NAME LIKE '%rent_requests%' OR ACTION_STATEMENT LIKE '%Reserved%') LIMIT 50");
    result.suspect_triggers = trigs;

    // Count existing rent_requests with status 'reserved'
    const [[rrReserved]] = await pool.query("SELECT COUNT(*) AS cnt FROM rent_requests WHERE status = 'reserved'");
    result.rent_requests_reserved = Number(rrReserved.cnt || 0);

    console.log('\n=== Inventory Model Detection ===\n');
    console.log(JSON.stringify(result, null, 2));

    await pool.end();
    return result;
  } catch (err) {
    console.error('Error detecting inventory model:', err && err.message);
    try { await pool.end(); } catch (e) {}
    process.exit(1);
  }
}

if (require.main === module) {
  detect();
}

module.exports = detect;
