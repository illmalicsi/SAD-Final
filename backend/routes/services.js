const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/services - list all active services
router.get('/', async (req, res) => {
  try {
    // Disable caching for fresh data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const [rows] = await pool.query('SELECT service_id, name, description, default_price, duration_minutes, is_active FROM services WHERE is_active = 1 ORDER BY name ASC');
    res.json({ success: true, services: rows });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services', error: error.message });
  }
});

// GET /api/services/all - list all services including inactive (admin only)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    
    const [rows] = await pool.query('SELECT service_id, name, description, default_price, duration_minutes, is_active FROM services ORDER BY name ASC');
    res.json({ success: true, services: rows });
  } catch (error) {
    console.error('Error fetching all services:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services', error: error.message });
  }
});

// PUT /api/services/:id - update service details (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, default_price, duration_minutes, is_active } = req.body;

    console.log('📝 Updating service', id, 'with data:', { name, description, default_price, duration_minutes, is_active });

    if (!name || default_price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name and default_price are required'
      });
    }

    const [result] = await pool.query(
      `UPDATE services 
       SET name = ?, description = ?, default_price = ?, duration_minutes = ?, is_active = ?
       WHERE service_id = ?`,
      [name, description || null, default_price, duration_minutes || null, is_active !== undefined ? is_active : 1, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const [updated] = await pool.query('SELECT * FROM services WHERE service_id = ?', [id]);

    console.log('✅ Service updated successfully');
    res.json({
      success: true,
      message: 'Service updated successfully',
      service: updated[0]
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: error.message
    });
  }
});

// POST /api/services - create new service (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, default_price, duration_minutes, is_active } = req.body;

    console.log('➕ Creating new service:', { name, description, default_price, duration_minutes });

    if (!name || default_price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name and default_price are required'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO services (name, description, default_price, duration_minutes, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description || null, default_price, duration_minutes || null, is_active !== undefined ? is_active : 1]
    );

    const [newService] = await pool.query('SELECT * FROM services WHERE service_id = ?', [result.insertId]);

    console.log('✅ Service created successfully');
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: newService[0]
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: error.message
    });
  }
});

module.exports = router;
