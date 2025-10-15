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

// POST /api/users - create new user (admin only)
router.post('/', authenticateToken, requireMember, async (req, res) => {
  try {
    console.log('📝 POST /api/users - Creating user by:', req.user.email);
    const { firstName, lastName, email, role, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !role || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if user already exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'User with this email already exists' });
    }

    // Get role_id from role_name
    const [roleRows] = await pool.execute('SELECT role_id FROM roles WHERE role_name = ?', [role]);
    if (roleRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const roleId = roleRows[0].role_id;

    // Insert user (plaintext password for school project - matching authService pattern)
    const [result] = await pool.execute(
      `INSERT INTO users (first_name, last_name, email, password_hash, role_id, is_active, is_blocked, created_at)
       VALUES (?, ?, ?, ?, ?, 1, 0, NOW())`,
      [firstName, lastName, email, password, roleId]
    );

    // Fetch the created user
    const [newUser] = await pool.execute(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.is_active, u.is_blocked, r.role_name, u.created_at
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.id = ?`,
      [result.insertId]
    );

    const user = {
      id: newUser[0].id,
      firstName: newUser[0].first_name,
      lastName: newUser[0].last_name,
      email: newUser[0].email,
      role: newUser[0].role_name,
      isActive: !!newUser[0].is_active,
      isBlocked: !!newUser[0].is_blocked,
      createdAt: newUser[0].created_at
    };

    console.log('✅ User created successfully:', user.email);
    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error('❌ POST /api/users error:', error);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
});

// PUT /api/users/:id - update user (admin only)
router.put('/:id', authenticateToken, requireMember, async (req, res) => {
  try {
    console.log('📝 PUT /api/users/:id - Updating user by:', req.user.email);
    const { id } = req.params;
    const { firstName, lastName, email, role, isActive, isBlocked } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if user exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if email is taken by another user
    const [emailCheck] = await pool.execute('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
    if (emailCheck.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    // Get role_id from role_name
    const [roleRows] = await pool.execute('SELECT role_id FROM roles WHERE role_name = ?', [role]);
    if (roleRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const roleId = roleRows[0].role_id;

    // Update user
    await pool.execute(
      `UPDATE users SET first_name = ?, last_name = ?, email = ?, role_id = ?, is_active = ?, is_blocked = ?
       WHERE id = ?`,
      [firstName, lastName, email, roleId, isActive ? 1 : 0, isBlocked ? 1 : 0, id]
    );

    // Fetch updated user
    const [updatedUser] = await pool.execute(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.is_active, u.is_blocked, r.role_name, u.created_at
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.id = ?`,
      [id]
    );

    const user = {
      id: updatedUser[0].id,
      firstName: updatedUser[0].first_name,
      lastName: updatedUser[0].last_name,
      email: updatedUser[0].email,
      role: updatedUser[0].role_name,
      isActive: !!updatedUser[0].is_active,
      isBlocked: !!updatedUser[0].is_blocked,
      createdAt: updatedUser[0].created_at
    };

    console.log('✅ User updated successfully:', user.email);
    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ PUT /api/users/:id error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - delete user (admin only)
router.delete('/:id', authenticateToken, requireMember, async (req, res) => {
  try {
    console.log('🗑️ DELETE /api/users/:id - Deleting user by:', req.user.email);
    const { id } = req.params;

    // Check if user exists
    const [existing] = await pool.execute('SELECT id, email FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting yourself
    if (existing[0].email === req.user.email) {
      return res.status(403).json({ success: false, message: 'Cannot delete your own account' });
    }

    // Delete user
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);

    console.log('✅ User deleted successfully:', existing[0].email);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ DELETE /api/users/:id error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

module.exports = router;
