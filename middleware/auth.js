const jwt  = require('jsonwebtoken');
const { isMongoConnected, loadStore } = require('../config/store');

const JWT_SECRET = () => process.env.JWT_SECRET || 'fas_dev_secret_change_in_prod';

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1] : null;
  if (!token) return res.status(401).json({ success:false, error:'Not authorized — no token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET());

    if (isMongoConnected()) {
      const User = require('../models/User');
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user || !req.user.isActive)
        return res.status(401).json({ success:false, error:'User not found or disabled' });
    } else {
      const store = loadStore();
      const user  = store.users.find(u => u._id === decoded.id);
      if (!user || !user.isActive)
        return res.status(401).json({ success:false, error:'User not found or disabled' });
      const { password:_, ...safe } = user;
      req.user = safe;
    }
    next();
  } catch(e) {
    res.status(401).json({ success:false, error:'Token invalid or expired' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return res.status(403).json({ success:false, error:`Role '${req.user?.role}' not authorized` });
  next();
};

module.exports = { protect, authorize };
