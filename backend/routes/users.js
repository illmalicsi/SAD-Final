const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
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

// GET /api/users/:id - return single user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.birthday, u.instrument, u.address, 
             u.is_active, u.is_blocked, r.role_name, u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = {
      id: rows[0].id,
      firstName: rows[0].first_name,
      lastName: rows[0].last_name,
      email: rows[0].email,
      phone: rows[0].phone,
      birthday: rows[0].birthday,
      instrument: rows[0].instrument,
      address: rows[0].address,
      role: rows[0].role_name,
      isActive: !!rows[0].is_active,
      isBlocked: !!rows[0].is_blocked,
      createdAt: rows[0].created_at
    };

    res.json({ success: true, user });
  } catch (error) {
    console.error('GET /api/users/:id error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
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

    // Hash password using bcrypt (10 rounds is a good balance of security and performance)
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user with hashed password
    const [result] = await pool.execute(
      `INSERT INTO users (first_name, last_name, email, password_hash, role_id, is_active, is_blocked, created_at)
       VALUES (?, ?, ?, ?, ?, 1, 0, NOW())`,
      [firstName, lastName, email, passwordHash, roleId]
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

// PUT /api/users/profile - Update current user's profile (must be BEFORE /:id route)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const userId = req.user.id;

    console.log('📝 Updating profile for user:', req.user.email, 'New name:', firstName, lastName);

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'First name and last name are required' });
    }

    // Update user's name in database
    await pool.execute(
      'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
      [firstName, lastName, userId]
    );

    console.log('✅ Profile updated successfully for:', req.user.email);
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: {
        id: userId,
        firstName,
        lastName,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('❌ PUT /api/users/profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
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

    console.log(`🔄 Updating user ${id}:`, {
      firstName, lastName, email, roleId,
      isActive: isActive ? 1 : 0,
      isBlocked: isBlocked ? 1 : 0
    });

    // Update user (without avatar - column doesn't exist)
    await pool.execute(
      `UPDATE users SET first_name = ?, last_name = ?, email = ?, role_id = ?, is_active = ?, is_blocked = ?
       WHERE id = ?`,
      [firstName, lastName, email, roleId, isActive ? 1 : 0, isBlocked ? 1 : 0, id]
    );

    console.log(`✅ User ${id} updated in database`);

    // Fetch updated user (without avatar - column doesn't exist)
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

// PATCH /api/users/:id/avatar - update user avatar (authenticated users can update their own)
router.patch('/:id/avatar', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { avatar } = req.body;

    console.log('🖼️ PATCH /api/users/:id/avatar - Updating avatar for user:', id);

    // Users can only update their own avatar unless they're admin
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only update your own avatar' });
    }

    // Update avatar (null to remove)
    await pool.execute(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [avatar || null, id]
    );

    // Fetch updated user with avatar
    const [updatedUser] = await pool.execute(
      'SELECT id, first_name, last_name, email, avatar FROM users WHERE id = ?',
      [id]
    );

    if (updatedUser.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('✅ Avatar updated successfully for user:', id);
    res.json({
      success: true,
      user: {
        id: updatedUser[0].id,
        firstName: updatedUser[0].first_name,
        lastName: updatedUser[0].last_name,
        email: updatedUser[0].email,
        avatar: updatedUser[0].avatar
      }
    });
  } catch (error) {
    console.error('❌ PATCH /api/users/:id/avatar error:', error);
    res.status(500).json({ success: false, message: 'Failed to update avatar' });
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
