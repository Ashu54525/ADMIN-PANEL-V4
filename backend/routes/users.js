const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Activity = require('../models/Activity');
const { protect, adminOnly } = require('../middleware/auth');

// GET all users
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const users = await User.find().populate('createdBy', 'username fullName');
      return res.json({ success: true, users });
    }
    res.json({ success: true, users: [req.user] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST create user (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { username, email, password, fullName, phone, department, permissions } = req.body;
    const user = await User.create({
      username, email, password, fullName, phone, department,
      role: 'user', createdBy: req.user._id, permissions: permissions || {}
    });
    await Activity.create({
      user: req.user._id, action: 'USER_CREATED',
      description: `Admin created user: ${username}`, ipAddress: req.ip
    });
    res.status(201).json({ success: true, user });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ success: false, message: `${field} already exists.` });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single user
router.get('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id)
      return res.status(403).json({ success: false, message: 'Access denied.' });
    const user = await User.findById(req.params.id).populate('createdBy', 'username fullName');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT update user
router.put('/:id', protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isSelf = req.user._id.toString() === req.params.id;
    if (!isAdmin && !isSelf) return res.status(403).json({ success: false, message: 'Access denied.' });

    const allowedFields = isAdmin
      ? ['fullName', 'phone', 'department', 'email', 'isActive', 'permissions']
      : ['fullName', 'phone'];

    const updates = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    if (req.body.profilePhoto !== undefined) updates.profilePhoto = req.body.profilePhoto;

    if (req.body.password) {
      const user = await User.findById(req.params.id);
      user.password = req.body.password;
      Object.assign(user, updates);
      await user.save();
      return res.json({ success: true, user });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    await Activity.create({
      user: req.user._id, action: isAdmin ? 'USER_UPDATED' : 'PROFILE_UPDATE',
      description: `${isAdmin ? 'Admin updated' : 'User updated'} profile for ${user.username}`, ipAddress: req.ip
    });

    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE user (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id)
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    await Activity.create({
      user: req.user._id, action: 'USER_DELETED',
      description: `Admin deleted user: ${user.username}`, ipAddress: req.ip
    });
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
