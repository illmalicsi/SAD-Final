const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
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