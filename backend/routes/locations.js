const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/locations - list active locations
router.get('/', async (req, res, next) => {
  // Optional ?type=primary|secondary to filter locations by type
  const { type } = req.query;
  try {
    let sql = `SELECT location_id, location_name, location_type, is_active
               FROM locations
               WHERE is_active = TRUE`;

    const params = [];

    if (type === 'primary' || type === 'secondary') {
      sql += ` AND location_type = ?`;
      params.push(type);
    }

    sql += ` ORDER BY location_type, location_name`;

    const [rows] = await pool.query(sql, params);

    res.json({ success: true, locations: rows });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
