const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const protect = async (req, res, next) => {
  let token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) return res.status(401).json({ success: false, error: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user || !req.user.isActive) return res.status(401).json({ success: false, error: 'User not found' });
    next();
  } catch(e) {
    res.status(401).json({ success: false, error: 'Token invalid or expired' });
  }
};

// Role-based access
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: `Role '${req.user.role}' is not authorized` });
  }
  next();
};

module.exports = { protect, authorize };
