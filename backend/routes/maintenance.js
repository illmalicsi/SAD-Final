const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// ============================================================================
// MAINTENANCE HISTORY ENDPOINTS
// ============================================================================

// Get all maintenance records with optional filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      instrumentItemId, 
      instrumentId,
      maintenanceType, 
      status,
      fromDate,
      toDate 
    } = req.query;

    let query = `
      SELECT 
        mh.*,
        ii.serial_number,
        i.name as instrument_name,
        i.category,
        i.brand,
        l.location_name,
        u.first_name as performed_by_first_name,
        u.last_name as performed_by_last_name,
        u.email as performed_by_email
      FROM maintenance_history mh
      JOIN instrument_items ii ON mh.instrument_item_id = ii.item_id
      JOIN instruments i ON ii.instrument_id = i.instrument_id
      LEFT JOIN locations l ON ii.location_id = l.location_id
      LEFT JOIN users u ON mh.performed_by = u.id
      WHERE 1=1
    `;

    const params = [];

    if (instrumentItemId) {
      query += ' AND mh.instrument_item_id = ?';
      params.push(instrumentItemId);
    }

    if (instrumentId) {
      query += ' AND ii.instrument_id = ?';
      params.push(instrumentId);
    }

    if (maintenanceType) {
      query += ' AND mh.maintenance_type = ?';
      params.push(maintenanceType);
    }

    if (status) {
      query += ' AND mh.status = ?';
      params.push(status);
    }

    if (fromDate) {
      query += ' AND (mh.completed_date >= ? OR mh.scheduled_date >= ?)';
      params.push(fromDate, fromDate);
    }

    if (toDate) {
      query += ' AND (mh.completed_date <= ? OR mh.scheduled_date <= ?)';
      params.push(toDate, toDate);
    }

    query += ' ORDER BY COALESCE(mh.completed_date, mh.scheduled_date) DESC, mh.created_at DESC';

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      records: rows,
      total: rows.length
    });
  } catch (error) {
    console.error('Error fetching maintenance history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch maintenance history' });
  }
});

// Get single maintenance record
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        mh.*,
        ii.serial_number,
        ii.status as current_status,
        ii.condition_status as current_condition,
        i.name as instrument_name,
        i.category,
        i.brand,
        l.location_name,
        u.first_name as performed_by_first_name,
        u.last_name as performed_by_last_name,
        u.email as performed_by_email
      FROM maintenance_history mh
      JOIN instrument_items ii ON mh.instrument_item_id = ii.item_id
      JOIN instruments i ON ii.instrument_id = i.instrument_id
      LEFT JOIN locations l ON ii.location_id = l.location_id
      LEFT JOIN users u ON mh.performed_by = u.id
      WHERE mh.maintenance_id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    res.json({
      success: true,
      record: rows[0]
    });
  } catch (error) {
    console.error('Error fetching maintenance record:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch maintenance record' });
  }
});

// Create new maintenance record
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const {
      instrument_item_id,
      maintenance_type,
      description,
      cost,
      performed_by_name,
      scheduled_date,
      completed_date,
      next_maintenance_date,
      status,
      parts_replaced,
      before_condition,
      after_condition,
      before_photo_url,
      after_photo_url,
      notes
    } = req.body;

    if (!instrument_item_id || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Instrument item ID and description are required' 
      });
    }

    // Verify instrument item exists
    const [itemCheck] = await pool.query(
      'SELECT item_id FROM instrument_items WHERE item_id = ?',
      [instrument_item_id]
    );

    if (itemCheck.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Instrument item not found' 
      });
    }

    const [result] = await pool.query(`
      INSERT INTO maintenance_history (
        instrument_item_id, maintenance_type, description, cost, performed_by,
        performed_by_name, scheduled_date, completed_date, next_maintenance_date,
        status, parts_replaced, before_condition, after_condition,
        before_photo_url, after_photo_url, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      instrument_item_id,
      maintenance_type || 'Routine',
      description,
      cost || 0,
      userId,
      performed_by_name || `${req.user.first_name} ${req.user.last_name}`,
      scheduled_date || null,
      completed_date || null,
      next_maintenance_date || null,
      status || 'Completed',
      parts_replaced || null,
      before_condition || null,
      after_condition || null,
      before_photo_url || null,
      after_photo_url || null,
      notes || null
    ]);

    // Update instrument item's last maintenance date and condition if completed
    if (completed_date && after_condition) {
      await pool.query(`
        UPDATE instrument_items 
        SET last_maintenance_date = ?, condition_status = ?
        WHERE item_id = ?
      `, [completed_date, after_condition, instrument_item_id]);
    }

    // Log to audit trail
    await pool.query(`
      INSERT INTO audit_log (table_name, record_id, action, user_id, user_email, after_value)
      VALUES ('maintenance_history', ?, 'CREATE', ?, ?, ?)
    `, [result.insertId, userId, req.user.email, JSON.stringify(req.body)]);

    res.json({
      success: true,
      message: 'Maintenance record created successfully',
      maintenanceId: result.insertId
    });
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    res.status(500).json({ success: false, message: 'Failed to create maintenance record' });
  }
});

// Update maintenance record
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { id } = req.params;
    const {
      maintenance_type,
      description,
      cost,
      scheduled_date,
      completed_date,
      next_maintenance_date,
      status,
      parts_replaced,
      before_condition,
      after_condition,
      before_photo_url,
      after_photo_url,
      notes
    } = req.body;

    // Get current state for audit
    const [current] = await pool.query('SELECT * FROM maintenance_history WHERE maintenance_id = ?', [id]);
    if (current.length === 0) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    const updates = [];
    const values = [];

    if (maintenance_type !== undefined) { updates.push('maintenance_type = ?'); values.push(maintenance_type); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (cost !== undefined) { updates.push('cost = ?'); values.push(cost); }
    if (scheduled_date !== undefined) { updates.push('scheduled_date = ?'); values.push(scheduled_date); }
    if (completed_date !== undefined) { updates.push('completed_date = ?'); values.push(completed_date); }
    if (next_maintenance_date !== undefined) { updates.push('next_maintenance_date = ?'); values.push(next_maintenance_date); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (parts_replaced !== undefined) { updates.push('parts_replaced = ?'); values.push(parts_replaced); }
    if (before_condition !== undefined) { updates.push('before_condition = ?'); values.push(before_condition); }
    if (after_condition !== undefined) { updates.push('after_condition = ?'); values.push(after_condition); }
    if (before_photo_url !== undefined) { updates.push('before_photo_url = ?'); values.push(before_photo_url); }
    if (after_photo_url !== undefined) { updates.push('after_photo_url = ?'); values.push(after_photo_url); }
    if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);
    await pool.query(
      `UPDATE maintenance_history SET ${updates.join(', ')}, updated_at = NOW() WHERE maintenance_id = ?`,
      values
    );

    // Update instrument item if maintenance completed
    if (completed_date && after_condition) {
      await pool.query(`
        UPDATE instrument_items 
        SET last_maintenance_date = ?, condition_status = ?
        WHERE item_id = ?
      `, [completed_date, after_condition, current[0].instrument_item_id]);
    }

    // Log to audit trail
    await pool.query(`
      INSERT INTO audit_log (table_name, record_id, action, user_id, user_email, before_value, after_value)
      VALUES ('maintenance_history', ?, 'UPDATE', ?, ?, ?, ?)
    `, [id, userId, req.user.email, JSON.stringify(current[0]), JSON.stringify(req.body)]);

    res.json({
      success: true,
      message: 'Maintenance record updated successfully'
    });
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    res.status(500).json({ success: false, message: 'Failed to update maintenance record' });
  }
});

// Get upcoming maintenance (scheduled but not completed)
router.get('/upcoming/scheduled', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        mh.*,
        ii.serial_number,
        i.name as instrument_name,
        i.category,
        l.location_name
      FROM maintenance_history mh
      JOIN instrument_items ii ON mh.instrument_item_id = ii.item_id
      JOIN instruments i ON ii.instrument_id = i.instrument_id
      LEFT JOIN locations l ON ii.location_id = l.location_id
      WHERE mh.status IN ('Scheduled', 'In Progress')
      AND (mh.scheduled_date >= CURDATE() OR mh.scheduled_date IS NULL)
      ORDER BY mh.scheduled_date ASC, mh.created_at DESC
    `);

    res.json({
      success: true,
      records: rows,
      total: rows.length
    });
  } catch (error) {
    console.error('Error fetching upcoming maintenance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch upcoming maintenance' });
  }
});

// Get maintenance statistics
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(cost) as total_cost,
        AVG(cost) as average_cost
      FROM maintenance_history
      WHERE YEAR(COALESCE(completed_date, scheduled_date, created_at)) = YEAR(CURDATE())
    `);

    const [byType] = await pool.query(`
      SELECT 
        maintenance_type,
        COUNT(*) as count,
        SUM(cost) as total_cost
      FROM maintenance_history
      WHERE YEAR(COALESCE(completed_date, scheduled_date, created_at)) = YEAR(CURDATE())
      GROUP BY maintenance_type
      ORDER BY count DESC
    `);

    const [recentCompleted] = await pool.query(`
      SELECT 
        mh.*,
        ii.serial_number,
        i.name as instrument_name
      FROM maintenance_history mh
      JOIN instrument_items ii ON mh.instrument_item_id = ii.item_id
      JOIN instruments i ON ii.instrument_id = i.instrument_id
      WHERE mh.status = 'Completed'
      ORDER BY mh.completed_date DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      stats: stats[0],
      byType,
      recentCompleted
    });
  } catch (error) {
    console.error('Error fetching maintenance statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

module.exports = router;
