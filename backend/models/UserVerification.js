const mongoose = require('mongoose');

// Tracks each user's terms-acceptance & signature verification (one per user)
const userVerificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  termsAccepted: { type: Boolean, default: false },
  termsAcceptedAt: { type: Date },
  signatureImage: { type: String },
  signatureVerified: { type: Boolean, default: false },
  signatureVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  signatureVerifiedAt: { type: Date },
  status: {
    type: String,
    enum: ['not_started', 'pending_verification', 'verified', 'rejected'],
    default: 'not_started'
  },
  adminNotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('UserVerification', userVerificationSchema);
