const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET all band packages (public - for booking form)
router.get('/', async (req, res) => {
  try {
    const [packages] = await pool.query(
      'SELECT * FROM band_packages WHERE is_active = TRUE ORDER BY display_order, package_id'
    );
    res.json({ success: true, packages });
  } catch (error) {
    console.error('Error fetching band packages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch band packages' });
  }
});

// GET all band packages including inactive (admin only)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const [packages] = await pool.query(
      'SELECT * FROM band_packages ORDER BY display_order, package_id'
    );
    res.json({ success: true, packages });
  } catch (error) {
    console.error('Error fetching all band packages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch band packages' });
  }
});

// GET single band package by ID
router.get('/:id', async (req, res) => {
  try {
    const [packages] = await pool.query(
      'SELECT * FROM band_packages WHERE package_id = ?',
      [req.params.id]
    );
    
    if (packages.length === 0) {
      return res.status(404).json({ success: false, message: 'Band package not found' });
    }
    
    res.json({ success: true, package: packages[0] });
  } catch (error) {
    console.error('Error fetching band package:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch band package' });
  }
});

// CREATE new band package (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      package_key,
      package_name,
      description,
      price,
      num_players,
      includes_food,
      includes_transport,
      display_order
    } = req.body;

    // Validation
    if (!package_key || !package_name || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: 'Package key, name, and price are required'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO band_packages 
       (package_key, package_name, description, price, num_players, includes_food, includes_transport, display_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        package_key,
        package_name,
        description || null,
        price,
        num_players || null,
        includes_food || false,
        includes_transport || false,
        display_order || 0
      ]
    );

    const [newPackage] = await pool.query(
      'SELECT * FROM band_packages WHERE package_id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Band package created successfully',
      package: newPackage[0]
    });
  } catch (error) {
    console.error('Error creating band package:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ success: false, message: 'Package key already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to create band package' });
    }
  }
});

// UPDATE band package (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      package_key,
      package_name,
      description,
      price,
      num_players,
      includes_food,
      includes_transport,
      is_active,
      display_order
    } = req.body;

    // Validation
    if (!package_name || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: 'Package name and price are required'
      });
    }

    const [result] = await pool.query(
      `UPDATE band_packages 
       SET package_key = ?, 
           package_name = ?, 
           description = ?, 
           price = ?, 
           num_players = ?, 
           includes_food = ?, 
           includes_transport = ?, 
           is_active = ?,
           display_order = ?
       WHERE package_id = ?`,
      [
        package_key,
        package_name,
        description || null,
        price,
        num_players || null,
        includes_food !== undefined ? includes_food : false,
        includes_transport !== undefined ? includes_transport : false,
        is_active !== undefined ? is_active : true,
        display_order !== undefined ? display_order : 0,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Band package not found' });
    }

    const [updatedPackage] = await pool.query(
      'SELECT * FROM band_packages WHERE package_id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Band package updated successfully',
      package: updatedPackage[0]
    });
  } catch (error) {
    console.error('Error updating band package:', error);
    res.status(500).json({ success: false, message: 'Failed to update band package' });
  }
});

// DELETE band package (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM band_packages WHERE package_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Band package not found' });
    }

    res.json({
      success: true,
      message: 'Band package deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting band package:', error);
    res.status(500).json({ success: false, message: 'Failed to delete band package' });
  }
});

module.exports = router;
