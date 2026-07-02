const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
  expiresIn: process.env.JWT_EXPIRE || '7d'
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Username and password required.' });

    const user = await User.findOne({ $or: [{ username }, { email: username }] }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    if (!user.isActive)
      return res.status(401).json({ success: false, message: 'Account is deactivated. Contact admin.' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    await Activity.create({
      user: user._id, action: 'LOGIN',
      description: `${user.username} logged in`,
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    const token = signToken(user._id);
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', protect, async (req, res) => {
  try {
    await Activity.create({
      user: req.user._id, action: 'LOGOUT',
      description: `${req.user.username} logged out`, ipAddress: req.ip
    });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

// POST /api/auth/setup-admin
router.post('/setup-admin', async (req, res) => {
  try {
    const { setupKey, username, email, password, fullName } = req.body;
    if (setupKey !== (process.env.ADMIN_SETUP_KEY || 'admin_setup_secret_2024'))
      return res.status(403).json({ success: false, message: 'Invalid setup key.' });
    const existing = await User.findOne({ role: 'admin' });
    if (existing) return res.status(400).json({ success: false, message: 'Admin already exists.' });
    const admin = await User.create({ username, email, password, fullName, role: 'admin' });
    const token = signToken(admin._id);
    res.status(201).json({ success: true, message: 'Admin created!', token, user: admin });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
