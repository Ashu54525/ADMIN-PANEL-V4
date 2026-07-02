const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const ClientRecord = require('../models/ClientRecord');
const UserVerification = require('../models/UserVerification');
const Activity = require('../models/Activity');
const { protect, adminOnly } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ── VERIFICATION FLOW (terms + signature) ────────────────────────────────────

// GET my verification status
router.get('/verification/my', protect, async (req, res) => {
  try {
    let v = await UserVerification.findOne({ user: req.user._id });
    if (!v) v = await UserVerification.create({ user: req.user._id });
    res.json({ success: true, verification: v });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST accept terms + upload signature
router.post('/verification/accept-terms', protect, async (req, res) => {
  try {
    const { signatureImage } = req.body;
    if (!signatureImage) return res.status(400).json({ success: false, message: 'Signature image is required.' });

    let v = await UserVerification.findOne({ user: req.user._id });
    if (!v) v = new UserVerification({ user: req.user._id });
    if (v.termsAccepted) return res.status(400).json({ success: false, message: 'Already submitted.' });

    v.termsAccepted = true;
    v.termsAcceptedAt = new Date();
    v.signatureImage = signatureImage;
    v.status = 'pending_verification';
    await v.save();

    await Activity.create({
      user: req.user._id, action: 'FORM_SUBMIT',
      description: `${req.user.username} accepted terms and uploaded signature`,
      ipAddress: req.ip
    });

    res.json({ success: true, verification: v, message: 'Submitted! Waiting for admin verification.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET all verifications (admin)
router.get('/verification/all', protect, adminOnly, async (req, res) => {
  try {
    const verifications = await UserVerification.find()
      .populate('user', 'username fullName department profilePhoto')
      .populate('signatureVerifiedBy', 'username fullName')
      .sort({ createdAt: -1 });
    res.json({ success: true, verifications });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH verify/reject signature (admin)
router.patch('/verification/:id/verify', protect, adminOnly, async (req, res) => {
  try {
    const { verified, adminNotes } = req.body;
    const v = await UserVerification.findByIdAndUpdate(req.params.id, {
      signatureVerified: verified,
      signatureVerifiedBy: req.user._id,
      signatureVerifiedAt: new Date(),
      adminNotes: adminNotes || '',
      status: verified ? 'verified' : 'rejected'
    }, { new: true }).populate('user', 'username fullName');

    // Sync verified signature to user profile for display on forms
    if (verified && v.user) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(v.user._id, { signature: v.signatureImage, signatureDate: new Date() });
    }

    await Activity.create({
      user: req.user._id, action: 'USER_UPDATED',
      description: `Admin ${verified ? 'verified' : 'rejected'} signature for ${v.user?.username}`,
      ipAddress: req.ip
    });

    res.json({ success: true, verification: v });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── BULK UPLOAD (ADMIN) ───────────────────────────────────────────────────────

// POST upload Excel file with client records
router.post('/records/upload', protect, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (rows.length === 0) return res.status(400).json({ success: false, message: 'Excel file is empty.' });

    // Flexible column mapping — handles variations in header names
    const findKey = (row, candidates) => {
      const keys = Object.keys(row);
      for (const c of candidates) {
        const match = keys.find(k => k.toLowerCase().trim().includes(c));
        if (match) return match;
      }
      return null;
    };

    const sample = rows[0];
    const nameKey = findKey(sample, ['name']);
    const idKey = findKey(sample, ['unique number', 'unique id', 'id']);
    const amountKey = findKey(sample, ['monthly income', 'amount', 'income']);
    const addressKey = findKey(sample, ['address', 'adress']);
    const phoneKey = findKey(sample, ['contact', 'phone']);

    const batchId = 'batch_' + Date.now();
    const lastOrder = await ClientRecord.countDocuments();

    const docs = rows.map((row, i) => ({
      name: String(row[nameKey] || '').trim(),
      uniqueId: String(row[idKey] || '').trim(),
      amount: String(row[amountKey] || '').trim(),
      phoneNumber: String(row[phoneKey] || '').trim(),
      address: String(row[addressKey] || '').trim(),
      batchId,
      order: lastOrder + i,
      status: 'unassigned'
    })).filter(d => d.name && d.uniqueId);

    if (docs.length === 0) {
      return res.status(400).json({ success: false, message: 'Could not detect valid columns. Expected: Name, Unique Number, Monthly Income, Address, Contact Details.' });
    }

    await ClientRecord.insertMany(docs);

    await Activity.create({
      user: req.user._id, action: 'FORM_SUBMIT',
      description: `Admin uploaded ${docs.length} client records (batch ${batchId})`,
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, count: docs.length, message: `${docs.length} records uploaded successfully!` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET records stats overview (admin)
router.get('/records/stats', protect, adminOnly, async (req, res) => {
  try {
    const [total, unassigned, assigned, filled] = await Promise.all([
      ClientRecord.countDocuments(),
      ClientRecord.countDocuments({ status: 'unassigned' }),
      ClientRecord.countDocuments({ status: 'assigned' }),
      ClientRecord.countDocuments({ status: 'filled' })
    ]);
    res.json({ success: true, stats: { total, unassigned, assigned, filled } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET all filled records — admin reviews what users submitted
router.get('/records/filled', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const filter = { status: 'filled' };
    if (req.query.userId) filter.assignedTo = req.query.userId;

    const [records, total] = await Promise.all([
      ClientRecord.find(filter)
        .populate('assignedTo', 'username fullName department profilePhoto signature')
        .sort({ filledAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ClientRecord.countDocuments(filter)
    ]);

    res.json({ success: true, records, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET per-user progress (admin)
router.get('/records/progress', protect, adminOnly, async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find({ role: 'user' });
    const progress = await Promise.all(users.map(async (u) => {
      const [assignedCount, filledCount] = await Promise.all([
        ClientRecord.countDocuments({ assignedTo: u._id }),
        ClientRecord.countDocuments({ assignedTo: u._id, status: 'filled' })
      ]);
      return {
        user: { _id: u._id, username: u.username, fullName: u.fullName, profilePhoto: u.profilePhoto },
        assignedCount, filledCount,
        remainingCount: assignedCount - filledCount
      };
    }));
    res.json({ success: true, progress });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE all unassigned records (admin reset)
router.delete('/records/reset-unassigned', protect, adminOnly, async (req, res) => {
  try {
    const result = await ClientRecord.deleteMany({ status: 'unassigned' });
    res.json({ success: true, deleted: result.deletedCount });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── USER: GET NEXT CARD & SUBMIT ──────────────────────────────────────────────

// GET my current assigned card (the one I'm filling now)
router.get('/records/current', protect, async (req, res) => {
  try {
    // Find a record already assigned to me but not yet filled
    let record = await ClientRecord.findOne({ assignedTo: req.user._id, status: 'assigned' }).sort({ order: 1 });

    // If none assigned, pull the next unassigned one and assign it to me
    if (!record) {
      record = await ClientRecord.findOneAndUpdate(
        { status: 'unassigned' },
        { assignedTo: req.user._id, status: 'assigned' },
        { new: true, sort: { order: 1 } }
      );
    }

    if (!record) return res.json({ success: true, record: null, message: 'No more records available.' });
    res.json({ success: true, record });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET my progress (how many filled / total assigned to me)
router.get('/records/my-progress', protect, async (req, res) => {
  try {
    const [assignedCount, filledCount, remainingUnassigned] = await Promise.all([
      ClientRecord.countDocuments({ assignedTo: req.user._id }),
      ClientRecord.countDocuments({ assignedTo: req.user._id, status: 'filled' }),
      ClientRecord.countDocuments({ status: 'unassigned' })
    ]);
    res.json({ success: true, assignedCount, filledCount, remainingUnassigned });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST submit the current card's filled data
router.post('/records/:id/submit', protect, async (req, res) => {
  try {
    const { filledName, filledUniqueId, filledAmount, filledPhoneNumber, filledAddress } = req.body;

    const record = await ClientRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
    if (record.assignedTo?.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'This record is not assigned to you.' });
    if (record.status === 'filled')
      return res.status(400).json({ success: false, message: 'Already filled.' });

    record.filledName = filledName;
    record.filledUniqueId = filledUniqueId;
    record.filledAmount = filledAmount;
    record.filledPhoneNumber = filledPhoneNumber;
    record.filledAddress = filledAddress;
    record.status = 'filled';
    record.filledAt = new Date();
    await record.save();

    await Activity.create({
      user: req.user._id, action: 'FORM_SUBMIT',
      description: `${req.user.username} filled record: ${record.uniqueId}`,
      metadata: { recordId: record._id }, ipAddress: req.ip
    });

    res.json({ success: true, record, message: 'Saved! Loading next record...' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
