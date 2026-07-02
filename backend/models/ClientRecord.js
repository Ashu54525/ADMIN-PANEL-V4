const mongoose = require('mongoose');

// One row from the Excel sheet = one client record (the "card")
const clientRecordSchema = new mongoose.Schema({
  // Original data uploaded by admin (from Excel)
  name: { type: String, required: true },
  uniqueId: { type: String, required: true },     // "id" on the card
  amount: { type: String, required: true },        // "amount" on the card (was Monthly Income)
  phoneNumber: { type: String, required: true },    // "phone number" on the card
  address: { type: String, required: true },

  // Assignment & fill state
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ['unassigned', 'assigned', 'filled'],
    default: 'unassigned'
  },

  // What the user actually typed/filled for this record
  filledName: { type: String },
  filledUniqueId: { type: String },
  filledAmount: { type: String },
  filledPhoneNumber: { type: String },
  filledAddress: { type: String },

  filledAt: { type: Date },
  batchId: { type: String }, // which upload batch this came from
  order: { type: Number }    // sequence order for "one by one" assignment
}, { timestamps: true });

clientRecordSchema.index({ assignedTo: 1, status: 1 });
clientRecordSchema.index({ status: 1, order: 1 });

module.exports = mongoose.model('ClientRecord', clientRecordSchema);
