const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireMember } = require('../middleware/auth');

// GET /api/users - return list of users (no password)
router.get('/', authenticateToken, requireMember, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.is_active, u.is_blocked, r.role_name, u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      ORDER BY u.id ASC
    `);

    const users = rows.map(u => ({
      id: u.id,
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email,
      role: u.role_name,
      isActive: !!u.is_active,
      isBlocked: !!u.is_blocked,
      createdAt: u.created_at
    }));

    res.json({ success: true, users });
  } catch (error) {
    console.error('GET /api/users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

module.exports = router;
