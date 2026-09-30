/**
 * Authentication & Authorization Middleware
 * Verifies Bearer JWT tokens in Authorization headers,
 * attaches user document to req.user, and enforces role-based access control.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verifies JWT
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'foodverse_super_secret_jwt_key_2024_viva_ready_789';
    const decoded = jwt.verify(token, secret);

    // Attach user to request object (excluding password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
};

// Authorize specific user roles (e.g. 'restaurant_admin', 'delivery_partner', 'customer')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this resource. Required role: [${roles.join(', ')}]`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
