const mongoose = require('mongoose');

const tenderSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    min: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'awarded'],
    default: 'active'
  },
  requirements: String,
  category: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Tender', tenderSchema);