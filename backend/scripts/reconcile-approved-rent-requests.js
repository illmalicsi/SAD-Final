#!/usr/bin/env node
/**
 * reconcile-approved-rent-requests.js
 *
 * Finds `approved` rent_requests that do not have enough concrete instrument_items
 * assigned (current_rental_id) and attempts to assign available items.
 *
 * Usage:
 *   node reconcile-approved-rent-requests.js [--dry] [--limit=N]
 *
 * Options:
 *   --dry       : Run in dry-run mode (no DB writes)
 *   --limit=N   : Limit number of requests to process (default: all)
 *
 * Run this from project root (it requires backend/config/database.js to exist).
 */

const { pool } = require('../config/database');

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry');
  const limitArg = argv.find(a => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : null;

  console.log(`Reconciliation started. dryRun=${dryRun}, limit=${limit || 'none'}`);

  try {
    const params = [];
    let limitSql = '';
    if (limit && Number.isInteger(limit) && limit > 0) {
      limitSql = ' LIMIT ?';
      params.push(limit);
    }

    const [requests] = await pool.query(
      `SELECT rr.request_id, rr.instrument_id, rr.quantity, COALESCE(ai.assigned,0) AS assigned
       FROM rent_requests rr
       LEFT JOIN (
         SELECT current_rental_id, COUNT(*) AS assigned FROM instrument_items WHERE current_rental_id IS NOT NULL GROUP BY current_rental_id
       ) ai ON rr.request_id = ai.current_rental_id
       WHERE rr.status = 'approved' AND COALESCE(ai.assigned,0) < rr.quantity
       ORDER BY rr.request_id` + limitSql,
      params
    );

    console.log(`Found ${requests.length} approved requests with insufficient assigned items`);

    const results = [];

    for (const r of requests) {
      const requestId = r.request_id;
      const instrumentId = r.instrument_id;
      const qty = Number(r.quantity) || 0;
      const assigned = Number(r.assigned) || 0;
      const need = qty - assigned;

      console.log(`\nProcessing request ${requestId}: instrument=${instrumentId}, qty=${qty}, assigned=${assigned}, need=${need}`);

      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        // Re-check assigned under lock
        const [verify] = await conn.query(
          `SELECT COALESCE(COUNT(*),0) AS assigned FROM instrument_items WHERE current_rental_id = ? FOR UPDATE`,
          [requestId]
        );
        const nowAssigned = verify && verify[0] ? Number(verify[0].assigned) : 0;
        if (nowAssigned >= qty) {
          await conn.commit(); conn.release();
          console.log(`  Skipping request ${requestId}: already satisfied (assigned=${nowAssigned})`);
          results.push({ requestId, status: 'skipped', reason: 'already_satisfied', assigned: nowAssigned });
          continue;
        }

        const toAssign = qty - nowAssigned;

        // Lock available items for this instrument
        const [availRows] = await conn.query(
          `SELECT item_id FROM instrument_items WHERE instrument_id = ? AND is_active = TRUE AND status = 'Available' LIMIT ? FOR UPDATE`,
          [instrumentId, toAssign]
        );

        const assignIds = (availRows || []).map(x => x.item_id);

        if (!assignIds.length) {
          await conn.rollback(); conn.release();
          console.warn(`  No available instrument_items found for request ${requestId} (need ${toAssign})`);
          results.push({ requestId, status: 'failed', reason: 'no_available_items', needed: toAssign });
          continue;
        }

        console.log(`  Will reserve items: ${assignIds.join(', ')}`);

          if (!dryRun) {
          const placeholders = assignIds.map(() => '?').join(',');
          await conn.query(
            `UPDATE instrument_items SET status = 'Rented', current_rental_id = ?, updated_at = NOW() WHERE item_id IN (${placeholders})`,
            [requestId, ...assignIds]
          );

          try {
            await conn.query(
              `INSERT INTO audit_log (table_name, record_id, action, user_id, user_email, after_value) VALUES ('instrument_items', ?, 'RECONCILE_RESERVE', NULL, NULL, ?)`,
              [assignIds.join(','), JSON.stringify({ reservedItems: assignIds, requestId })]
            );
          } catch (alogErr) {
            console.warn('  Failed to write audit log for reserve:', alogErr && alogErr.message);
          }

          await conn.commit(); conn.release();
          console.log(`  Assigned ${assignIds.length} items to request ${requestId} (marked Rented)`);
          results.push({ requestId, status: 'rented', assigned: assignIds });
        } else {
          await conn.rollback(); conn.release();
          console.log('  Dry-run: no database changes applied');
          results.push({ requestId, status: 'dryrun', wouldReserve: assignIds });
        }
      } catch (txErr) {
        try { await conn.rollback(); } catch (e) {}
        conn.release();
        console.error(`  Error processing request ${requestId}:`, txErr && txErr.message);
        results.push({ requestId, status: 'error', error: txErr && txErr.message });
      }
    }

    console.log('\nReconciliation complete. Summary:');
    console.log(JSON.stringify(results, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Fatal error during reconciliation:', err && err.message);
    process.exit(2);
  }
}

main();
