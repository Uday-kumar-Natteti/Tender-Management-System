const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  description: String,
  logoUrl: String,
  website: String,
  phone: String,
  address: String,
  services: [String] // Array of services/products offered
}, {
  timestamps: true
});

// Index for search functionality
companySchema.index({ name: 'text', description: 'text', services: 'text' });

module.exports = mongoose.model('Company', companySchema);