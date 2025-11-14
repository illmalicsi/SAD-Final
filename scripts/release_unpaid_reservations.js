const { pool } = require('../backend/config/database');

// Migration helper: report and optionally convert legacy 'reserved' rows.
// Usage:
//  - Dry run (report only): `node scripts/release_unpaid_reservations.js`
//  - Apply conversion for RESERVED requests whose invoice is paid:
//      `node scripts/release_unpaid_reservations.js --apply-paid`
// Notes:
//  - This script will NOT automatically convert unpaid reserved requests unless
//    explicit flags are provided. Back up your DB before running with --apply-paid.

async function run() {
  console.log('Reserved -> migration helper: starting');
  const conn = await pool.getConnection();
  try {
    // Count total reserved rent_requests
    const [totRows] = await conn.query(`SELECT COUNT(*) AS cnt FROM rent_requests WHERE status = 'reserved'`);
    const totalReserved = (totRows && totRows[0] && totRows[0].cnt) ? Number(totRows[0].cnt) : 0;

    // Count reserved requests with a paid invoice
    const [paidRows] = await conn.query(`
      SELECT COUNT(*) AS cnt
      FROM rent_requests r
      JOIN invoices i ON i.invoice_id = r.invoice_id
      WHERE r.status = 'reserved' AND i.status = 'paid'
    `);
    const reservedWithPaid = (paidRows && paidRows[0] && paidRows[0].cnt) ? Number(paidRows[0].cnt) : 0;

    // Count reserved without paid invoice
    const reservedWithoutPaid = totalReserved - reservedWithPaid;

    console.log(`Total rent_requests with status='reserved': ${totalReserved}`);
    console.log(`  reserved with paid invoice: ${reservedWithPaid}`);
    console.log(`  reserved without paid invoice: ${reservedWithoutPaid}`);

    const applyPaid = process.argv.includes('--apply-paid');
    if (!applyPaid) {
      console.log('\nNo changes will be made. To convert paid reserved requests to approved/Rented, re-run with --apply-paid');
      return;
    }

    if (reservedWithPaid === 0) {
      console.log('No paid reserved requests found to convert. Exiting.');
      return;
    }

    console.log(`Converting ${reservedWithPaid} paid reserved requests to approved + setting items to Rented`);

    // Fetch the request ids to convert
    const [rows] = await conn.query(`
      SELECT r.request_id
      FROM rent_requests r
      JOIN invoices i ON i.invoice_id = r.invoice_id
      WHERE r.status = 'reserved' AND i.status = 'paid'
    `);
    const ids = rows.map(r => r.request_id);

    // Process in a single transaction
    try {
      await conn.beginTransaction();

      // Update rent_requests -> approved
      const placeholders = ids.map(() => '?').join(',');
      await conn.query(
        `UPDATE rent_requests SET status = 'approved', approved_at = NOW(), reserved_until = NULL WHERE request_id IN (${placeholders})`,
        ids
      );

      // Set any assigned instrument_items to Rented
      await conn.query(
        `UPDATE instrument_items SET status = 'Rented', updated_at = NOW() WHERE current_rental_id IN (${placeholders})`,
        ids
      );

      // Update instruments availability for affected instruments (best-effort): set to 'Rented' if no inventory
      // We'll compute distinct instrument_ids from the affected requests
      const [instRows] = await conn.query(`SELECT DISTINCT instrument_id FROM rent_requests WHERE request_id IN (${placeholders})`, ids);
      const instIds = (instRows || []).map(r => r.instrument_id).filter(Boolean);
      for (const iid of instIds) {
        try {
          const [inv] = await conn.query('SELECT COALESCE(SUM(quantity),0) AS total FROM instrument_inventory WHERE instrument_id = ?', [iid]);
          const totalQty = (inv && inv[0] && inv[0].total) ? Number(inv[0].total) : 0;
          const newStatus = totalQty > 0 ? 'Available' : 'Rented';
          let safeStatus = newStatus;
          if (safeStatus === 'Reserved') safeStatus = 'Rented';
          const allowed = new Set(['Available','Rented','Borrowed','Maintenance','Unavailable']);
          if (!allowed.has(safeStatus)) safeStatus = 'Available';
          await conn.query('UPDATE instruments SET availability_status = ? WHERE instrument_id = ?', [safeStatus, iid]);
        } catch (iErr) {
          console.warn('Failed to update instrument availability for instrument', iid, iErr && iErr.message);
        }
      }

      await conn.commit();
      console.log('Conversion complete for paid reserved requests');
    } catch (applyErr) {
      try { await conn.rollback(); } catch (e) {}
      console.error('Failed to apply conversion:', applyErr && applyErr.message || applyErr);
      process.exit(1);
    }
  } finally {
    conn.release();
  }
}

run().catch(err => {
  console.error('Error running migration helper:', err && err.stack || err);
  process.exit(1);
});
