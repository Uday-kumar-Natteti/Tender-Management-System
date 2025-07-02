const express = require('express');
const router = express.Router();
const multer = require('multer');
const Joi = require('joi');
const Company = require('../models/Company');
const authenticateToken = require('../middleware/authenticate');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const upload = multer({ storage: multer.memoryStorage() });

// Joi validation schema
const companySchema = Joi.object({
  name: Joi.string().required(),
  industry: Joi.string().required(),
  description: Joi.string().optional(),
  website: Joi.string().uri().optional(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  services: Joi.array().items(Joi.string()).optional()
});

// Create new company
router.post('/', authenticateToken, async (req, res) => {
  try {
    const companyData = await companySchema.validateAsync(req.body);
    const newCompany = new Company({ ...companyData, userId: req.user.userId });
    const savedCompany = await newCompany.save();
    res.status(201).json(savedCompany);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get single company
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update company (only if owned by user)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company || company.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedData = await companySchema.validateAsync(req.body);
    const updated = await Company.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Upload company logo
router.post('/:id/logo', authenticateToken, upload.single('logo'), async (req, res) => {
  try {
    const file = req.file;
    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;

    const { error } = await supabase.storage.from('company-logos').upload(fileName, file.buffer, {
      contentType: file.mimetype
    });
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from('company-logos').getPublicUrl(fileName);
    await Company.findByIdAndUpdate(req.params.id, { logoUrl: publicUrl });

    res.json({ logoUrl: publicUrl });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete company (ownership check)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company || company.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await company.deleteOne();
    res.json({ message: 'Company deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
