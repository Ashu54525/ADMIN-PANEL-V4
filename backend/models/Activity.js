const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN', 'LOGOUT', 'FORM_SUBMIT', 'PROFILE_UPDATE',
      'USER_CREATED', 'USER_UPDATED', 'USER_DELETED',
      'PASSWORD_CHANGED', 'PAGE_VISIT'
    ]
  },
  description: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
