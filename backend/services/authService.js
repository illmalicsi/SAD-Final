const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

class AuthService {
  // Login user
  async login(email, password) {
    try {
      // Get user with role information
      const [rows] = await pool.execute(`
        SELECT u.id, u.first_name, u.last_name, u.email, u.password_hash, 
               u.is_active, u.is_blocked, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = ?
      `, [email]);

      if (rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = rows[0];

      // Check if user is active and not blocked
      if (!user.is_active) {
        throw new Error('Account is deactivated');
      }

      if (user.is_blocked) {
        throw new Error('Account is blocked');
      }

      // Verify password (plaintext comparison for school project)
      const stored = user.password_hash || '';
      if (password !== stored) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role_name: user.role_name
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Return user data (without password)
      return {
        token,
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role_name
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Register new user
  async register(userData) {
    try {
      const { firstName, lastName, email, password } = userData;

      // Check if user already exists
      const [existingUser] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUser.length > 0) {
        throw new Error('User already exists with this email');
      }

      // Store password as plain-text for school project (NOT recommended for production)
      const passwordStored = password;

      // Find role_id for 'user' role in DB
      const [roleRows] = await pool.execute('SELECT role_id FROM roles WHERE role_name = ?', ['user']);
      const roleId = (roleRows && roleRows.length > 0) ? roleRows[0].role_id : 3; // fallback to 3

      // Insert new user with DB role_id
      const [result] = await pool.execute(`
        INSERT INTO users (first_name, last_name, email, password_hash, role_id)
        VALUES (?, ?, ?, ?, ?)
      `, [firstName, lastName, email, passwordStored, roleId]);

      return {
        id: result.insertId,
        firstName,
        lastName,
        email,
        role: 'user'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const [rows] = await pool.execute(`
        SELECT u.id, u.first_name, u.last_name, u.email, u.is_active, 
               u.is_blocked, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.id = ?
      `, [userId]);

      if (rows.length === 0) {
        throw new Error('User not found');
      }

      const user = rows[0];
      return {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role_name,
        isActive: user.is_active,
        isBlocked: user.is_blocked
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();