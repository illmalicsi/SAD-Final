const { pool } = require('../config/database');

async function findCandidates() {
  const [rows] = await pool.execute(
    `SELECT rr.request_id, rr.invoice_id, rr.payment_amount, rr.remaining_balance, rr.status, rr.instrument_id, rr.user_id
       FROM rent_requests rr
      WHERE rr.status = 'reserved' AND (
        rr.payment_amount IS NOT NULL AND rr.payment_amount > 0
        OR EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = rr.invoice_id LIMIT 1)
      )`);
  return rows;
}

async function applyFix(requestId) {
  // Wrap each candidate in its own transaction for safety
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(`UPDATE rent_requests SET status = 'approved', paid_at = CURRENT_TIMESTAMP, updated_at = NOW() WHERE request_id = ?`, [requestId]);
    await conn.execute(`UPDATE instrument_items SET status = 'Rented', updated_at = NOW() WHERE current_rental_id = ?`, [requestId]);

    // Update instruments availability conservatively
    const [affected] = await conn.execute(`SELECT DISTINCT instrument_id FROM instrument_items WHERE current_rental_id = ?`, [requestId]);
    for (const a of (affected || [])) {
      try {
        const [[sumRow]] = await conn.execute(`SELECT COALESCE(SUM(quantity),0) AS total FROM instrument_inventory WHERE instrument_id = ?`, [a.instrument_id]);
        const remaining = Number(sumRow?.total || 0);
        const newStatus = remaining > 0 ? 'Available' : 'Rented';
        let safeStatus = newStatus;
        if (safeStatus === 'Reserved') safeStatus = 'Rented';
        const allowed = new Set(['Available','Rented','Borrowed','Maintenance','Unavailable']);
        if (!allowed.has(safeStatus)) safeStatus = 'Available';
        await conn.execute(`UPDATE instruments SET availability_status = ?, updated_at = NOW() WHERE instrument_id = ?`, [safeStatus, a.instrument_id]);
      } catch (e) {
        console.warn('Warning: failed to update instrument availability for', a.instrument_id, e && e.message);
      }
    }

    await conn.commit();
    return { success: true };
  } catch (err) {
    try { await conn.rollback(); } catch(e) {}
    return { success: false, error: err && err.message };
  } finally {
    conn.release();
  }
}

async function main() {
  const apply = process.argv.includes('--apply');
  console.log('Repair paid reservations - scanning for candidates (status = reserved but payments exist)');
  const candidates = await findCandidates();
  if (!candidates || candidates.length === 0) {
    console.log('No candidates found. Nothing to do.');
    process.exit(0);
  }
  console.log(`Found ${candidates.length} candidate(s):`);
  candidates.forEach(c => {
    console.log(`- request_id=${c.request_id}, invoice_id=${c.invoice_id}, payment_amount=${c.payment_amount}, remaining=${c.remaining_balance}, reserved_until=${c.reserved_until}`);
  });

  if (!apply) {
    console.log('\nRun this script with --apply to perform the status transitions and mark items as Rented.');
    process.exit(0);
  }

  console.log('\nApplying fixes...');
  let success = 0;
  for (const c of candidates) {
    const res = await applyFix(c.request_id);
    if (res.success) {
      console.log(`✅ request ${c.request_id} updated`);
      success++;
    } else {
      console.error(`❌ request ${c.request_id} failed: ${res.error}`);
    }
  }
  console.log(`Done. ${success}/${candidates.length} updated.`);
  process.exit(0);
}

main().catch(err => { console.error('Unexpected error:', err && err.message); process.exit(2); });
