const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader && authHeader.split(' ')[1];
  // Allow token to come from HttpOnly cookie named 'session' as a fallback
  const tokenFromCookie = req.cookies && req.cookies.session;
  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    // Normalize token payload: some tokens use `userId` while other places expect `id`.
    // Ensure downstream code can rely on `req.user.id` and `req.user.role_name`.
    try {
      const normalized = Object.assign({}, user);
      if (normalized.userId && !normalized.id) normalized.id = normalized.userId;
      if (normalized.role && !normalized.role_name) normalized.role_name = normalized.role;
      req.user = normalized;

      // Check if user is blocked or deactivated
      try {
        console.log(`🔍 Middleware checking user status for user ID: ${req.user.id}`);
        const [[dbUser]] = await pool.execute(
          'SELECT is_active, is_blocked FROM users WHERE id = ?',
          [req.user.id]
        );

        if (dbUser) {
          console.log(`📊 User status - is_active: ${dbUser.is_active}, is_blocked: ${dbUser.is_blocked}`);
          if (!dbUser.is_active) {
            console.log('❌ User is deactivated, sending 403');
            return res.status(403).json({ message: 'Account is deactivated', blocked: true });
          }
          if (dbUser.is_blocked) {
            console.log('🚫 User is blocked, sending 403');
            return res.status(403).json({ message: 'Account is blocked', blocked: true });
          }
          console.log('✅ User status OK, continuing');
        }
      } catch (dbErr) {
        console.error('Error checking user status:', dbErr);
        // Continue even if DB check fails (fallback to token validation only)
      }
    } catch (e) {
      req.user = user;
    }
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role_name !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const requireMember = (req, res, next) => {
  if (!['admin', 'member'].includes(req.user.role_name)) {
    return res.status(403).json({ message: 'Member access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireMember
};