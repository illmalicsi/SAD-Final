const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/roles - return list of roles
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT role_id, role_name FROM roles ORDER BY role_id');
    res.json({ success: true, roles: rows });
  } catch (error) {
    console.error('GET /api/roles error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch roles' });
  }
});

module.exports = router;
