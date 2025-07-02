const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Tender = require('../models/Tender');
const Company = require('../models/Company');
const authenticateToken = require('../middleware/authenticate');

// Tender schema
const tenderSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  budget: Joi.number().min(0).optional(),
  deadline: Joi.date().required(),
  requirements: Joi.string().optional(),
  category: Joi.string().optional()
});

// Get all tenders (search, filter, paginate)
router.get('/', async (req, res) => {
  try {
    const { q, category, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let filter = { status: 'active' };

    if (q) filter.title = new RegExp(q, 'i');
    if (category) filter.category = category;

    const tenders = await Tender.find(filter)
      .populate('companyId', 'name industry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Tender.countDocuments(filter);
    res.json({ tenders, pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single tender
router.get('/:id', async (req, res) => {
  try {
    const tender = await Tender.findById(req.params.id).populate('companyId', 'name industry');
    if (!tender) return res.status(404).json({ error: 'Tender not found' });
    res.json(tender);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create tender
router.post('/', authenticateToken, async (req, res) => {
  try {
    const input = await tenderSchema.validateAsync(req.body);
    const company = await Company.findOne({ userId: req.user.userId });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const tender = await Tender.create({ ...input, companyId: company._id });
    res.json(await Tender.findById(tender._id).populate('companyId', 'name industry'));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete tender (ownership check)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const tender = await Tender.findById(req.params.id);
    const company = await Company.findOne({ userId: req.user.userId });

    if (!tender || tender.companyId.toString() !== company._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await tender.deleteOne();
    res.json({ message: 'Tender deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
