const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'Not authenticated. Please login.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User no longer exists.' });
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account is deactivated.' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token. Please login again.' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
};

exports.logActivity = (action, descriptionFn) => async (req, res, next) => {
  const Activity = require('../models/Activity');
  const originalJson = res.json.bind(res);
  res.json = async (data) => {
    if (data.success && req.user) {
      try {
        await Activity.create({
          user: req.user._id,
          action,
          description: typeof descriptionFn === 'function' ? descriptionFn(req, data) : descriptionFn,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          metadata: req.body
        });
      } catch (e) { /* silent fail on log */ }
    }
    return originalJson(data);
  };
  next();
};
