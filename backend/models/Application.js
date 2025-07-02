const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  tenderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tender',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  proposal: {
    type: String,
    required: true
  },
  quotedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Ensure one application per company per tender
applicationSchema.index({ tenderId: 1, companyId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);