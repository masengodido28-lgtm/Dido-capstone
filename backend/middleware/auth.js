const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect middleware
 * Verifies the JWT token from the Authorization header.
 * Attaches the authenticated user to req.user for downstream handlers.
 * Usage: add as middleware to any protected route.
 */
const protect = async (req, res, next) => {
  let token;

  // Expect: Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorised, no token provided' });
  }

  try {
    // Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorised, user not found' });
    }

    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ message: 'Not authorised, token invalid or expired' });
  }
};

/**
 * adminOnly middleware
 * Restricts a route to users with role 'admin' or 'host'.
 * Must be used AFTER protect middleware.
 */
const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'host')) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: insufficient permissions' });
};

module.exports = { protect, adminOnly };
