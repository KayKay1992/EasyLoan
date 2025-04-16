// routes/settingsRoutes.js

const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  createSettings,
} = require('../controllers/settings.controller');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   GET /api/settings
// @desc    Get current settings
// @access  Public or Protected (you can change this)
router.get('/', getSettings);

// @route   POST /api/settings
// @desc    Create initial settings (once)
// @access  Admin
router.post('/', protect, adminOnly, createSettings);

// @route   PUT /api/settings
// @desc    Update system settings
// @access  Admin
router.put('/', protect, adminOnly, updateSettings);

module.exports = router;
