const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get pending membership applications (users with role 'user')
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.birthday,
        u.instrument,
        u.address,
        u.identity_proof,
        u.created_at,
        r.role_name
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE r.role_name = 'user' AND u.is_active = 1
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching pending members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending members'
    });
  }
});

// Approve membership (change role from 'user' to 'member')
router.put('/approve/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Get the 'member' role_id
    const [roleResult] = await pool.execute(
      'SELECT role_id FROM roles WHERE role_name = ?',
      ['member']
    );

    if (roleResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member role not found'
      });
    }

    const memberRoleId = roleResult[0].role_id;

    // Update user's role to 'member'
    await pool.execute(
      'UPDATE users SET role_id = ? WHERE id = ?',
      [memberRoleId, userId]
    );

    res.json({
      success: true,
      message: 'Member approved successfully'
    });
  } catch (error) {
    console.error('Error approving member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve member'
    });
  }
});

// Reject membership (set is_active to 0)
router.put('/reject/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    await pool.execute(
      'UPDATE users SET is_active = 0 WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Member rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject member'
    });
  }
});

module.exports = router;
