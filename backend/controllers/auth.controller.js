const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  // TODO: handle registration
  res.status(200).json({ message: 'Register user' });
});

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  // TODO: handle login
  res.status(200).json({ message: 'Login user' });
});

// @desc    Get current logged-in user (basic info)
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = asyncHandler(async (req, res) => {
  // TODO: return req.user (set in middleware)
  res.status(200).json({ message: 'Current user' });
});

// @desc    Get full user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // TODO: fetch and return user profile
  res.status(200).json({ message: 'User profile' });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  // TODO: update and return updated profile
  res.status(200).json({ message: 'Profile updated' });
});

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  getUserProfile,
  updateUserProfile
};
