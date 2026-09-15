
const jwt = require('jsonwebtoken');

const User = require('../models/User');

/**
 * protect middleware
 *
 * Verifies the JWT token from the Authorization header.
 * Attaches the authenticated user to req.user.
 *
 * Usage:
 * Add this middleware before any protected route.
 */
const protect = async (req, res, next) => {
  let token;

  // Expect:
  // Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // No token provided
  if (!token) {
    return res.status(401).json({
      message: 'Not authorised, no token provided'
    });
  }

  try {
    // Verify token signature and expiry
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find the user and exclude password
    req.user = await User.findById(decoded.id).select('-password');

    // User no longer exists
    if (!req.user) {
      return res.status(401).json({
        message: 'Not authorised, user not found'
      });
    }

    // Continue to the next middleware/controller
    next();
  } catch (err) {
    console.error(
      'Auth middleware error:',
      err.message
    );

    return res.status(401).json({
      message: 'Not authorised, token invalid or expired'
    });
  }
};

/**
 * adminOnly middleware
 *
 * Restricts a route to ADMIN users only.
 *
 * IMPORTANT:
 * This must be used AFTER protect middleware.
 */
const adminOnly = (req, res, next) => {
  // Only users with the admin role are allowed
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  // User is authenticated but does not have admin permissions
  return res.status(403).json({
    message: 'Access denied: admin permissions required'
  });
};

module.exports = {
  protect,
  adminOnly
};

