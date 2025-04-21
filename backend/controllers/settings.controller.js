// controllers/settingsController.js

const asyncHandler = require('express-async-handler');
const Settings = require('../models/settings.model');

// @desc    Get current settings
// @route   GET /api/settings
// @access  Public or Protected
const getSettings = asyncHandler(async (req, res) => {
    // Fetch the latest settings document
    const settings = await Settings.findOne().sort({ updatedAt: -1 });
  
    if (!settings) {
      res.status(404);
      throw new Error("Settings not found. Please initialize system settings.");
    }
  
    res.status(200).json({
      message: "Fetched system settings",
      settings,
    });
  });
  

// @desc    Create initial settings (if none exists)
// @route   POST /api/settings
// @access  Admin
const createSettings = asyncHandler(async (req, res) => {
    // Check if settings already exist
    const existing = await Settings.findOne();
    if (existing) {
      res.status(400);
      throw new Error("Settings already exist. You can update them instead.");
    }
  
    // Create new settings with provided values or defaults
    const {
      interestRate = 5.0,
      loanTermOptions = [6, 12, 24, 36],
      maxLoanAmount = 10000000,
      minLoanAmount = 10000,
      currency = 'NGN',
      gracePeriodDays = 7,
      latePaymentPenalty = 2.5,
    } = req.body;
  
    const settings = await Settings.create({
      interestRate,
      loanTermOptions,
      maxLoanAmount,
      minLoanAmount,
      currency,
      gracePeriodDays,
      latePaymentPenalty,
      updatedAt: new Date(),
    });
  
    res.status(201).json({
      message: "Settings created successfully",
      settings,
    });
  });
  

// @desc    Update settings
// @route   PUT /api/settings
// @access  Admin
const updateSettings = asyncHandler(async (req, res) => {
  // Logic to update existing settings
  const { interestRate, loanTermOptions, maxLoanAmount, minLoanAmount, currency, gracePeriodDays, latePaymentPenalty } = req.body;

  // Fetch the current settings
  const settings = await Settings.findOne();
  
  if (!settings) {
    res.status(404);
    throw new Error("Settings not found");
  }

  // Update settings fields if provided in the request body
  if (interestRate !== undefined) settings.interestRate = interestRate;
  if (loanTermOptions !== undefined) settings.loanTermOptions = loanTermOptions;
  if (maxLoanAmount !== undefined) settings.maxLoanAmount = maxLoanAmount;
  if (minLoanAmount !== undefined) settings.minLoanAmount = minLoanAmount;
  if (currency !== undefined) settings.currency = currency;
  if (gracePeriodDays !== undefined) settings.gracePeriodDays = gracePeriodDays;
  if (latePaymentPenalty !== undefined) settings.latePaymentPenalty = latePaymentPenalty;

  // Update the timestamp to reflect when the settings were last modified
  settings.updatedAt = Date.now();

  // Save the updated settings
  await settings.save();

  res.status(200).json({
    message: "Settings updated successfully",
    updatedSettings: settings
  });
});

module.exports = {
  getSettings,
  createSettings,
  updateSettings,
};
