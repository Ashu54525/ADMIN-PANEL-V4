const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [activities, total] = await Promise.all([
      Activity.find(filter).populate('user', 'username fullName role').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Activity.countDocuments(filter)
    ]);
    res.json({ success: true, activities, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/stats/overview', protect, adminOnly, async (req, res) => {
  try {
    const User = require('../models/User');
    const ClientRecord = require('../models/ClientRecord');
    const UserVerification = require('../models/UserVerification');

    const [totalUsers, activeUsers, totalRecords, filledRecords, pendingSigs, recentActivity, loginCount] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', isActive: true }),
      ClientRecord.countDocuments(),
      ClientRecord.countDocuments({ status: 'filled' }),
      UserVerification.countDocuments({ status: 'pending_verification' }),
      Activity.find().populate('user', 'username role').sort({ createdAt: -1 }).limit(10),
      Activity.countDocuments({ action: 'LOGIN', createdAt: { $gte: new Date(Date.now() - 86400000) } })
    ]);

    res.json({
      success: true,
      stats: { totalUsers, activeUsers, totalForms: totalRecords, filledRecords, pendingSigs, loginCount },
      recentActivity
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
