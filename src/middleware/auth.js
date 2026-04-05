const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'zorvyn-finance-dashboard-secret-key-2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid token - user not found'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        error: 'User account is inactive'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Invalid or expired token'
    });
  }
}

function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Insufficient permissions. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
}

function checkActiveUser(req, res, next) {
  if (!req.user.is_active) {
    return res.status(403).json({
      error: 'User account is inactive'
    });
  }
  next();
}

// Role hierarchy for checking if user has equal or higher permissions
function hasPermission(userRole, requiredRole) {
  const roleHierarchy = {
    viewer: 1,
    analyst: 2,
    admin: 3
  };

  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
}

module.exports = {
  authenticateToken,
  authorizeRole,
  checkActiveUser,
  hasPermission,
  JWT_SECRET
};
