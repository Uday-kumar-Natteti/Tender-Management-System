const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Application = require('../models/Application');
const Company = require('../models/Company');
const authenticateToken = require('../middleware/authenticate');

// Schema
const applicationSchema = Joi.object({
  proposal: Joi.string().min(10).required(),
  quotedPrice: Joi.number().min(1).required()
});

// Submit application
router.post('/:tenderId/applications', authenticateToken, async (req, res) => {
  try {
    const { proposal, quotedPrice } = await applicationSchema.validateAsync(req.body);
    const company = await Company.findOne({ userId: req.user.userId });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const application = await Application.create({
      tenderId: req.params.tenderId,
      companyId: company._id,
      proposal,
      quotedPrice
    });

    res.json(await application.populate('companyId', 'name industry'));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'You have already applied to this tender' });
    }
    res.status(400).json({ error: err.message });
  }
});

// Get all applications for a tender
router.get('/:tenderId/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await Application.find({ tenderId: req.params.tenderId })
      .populate('companyId', 'name industry')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update application status
router.patch('/applications/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('companyId', 'name industry');

    if (!updated) return res.status(404).json({ error: 'Application not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
