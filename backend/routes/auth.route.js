const express = require('express');
const { registerUser, loginUser, getCurrentUser, getUserProfile, updateUserProfile } = require('../controllers/auth.controller');
const { protect } = require('../middleware/authMiddleware');
const { uploadProfilePic } = require('../middleware/uploadProfilePic');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/auth/me
// @desc    Get currently logged-in user info
// @access  Private
router.get('/me', protect, getCurrentUser);

// @route   GET /api/auth/profile
// @desc    Get full user profile
// @access  Private
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile info
// @access  Private
router.put('/profile', protect, updateUserProfile);

// @route   POST /api/auth/upload-image
// @desc    Upload user profile image
// @access  Private
router.post('/upload-image', protect, uploadProfilePic);

module.exports = router;