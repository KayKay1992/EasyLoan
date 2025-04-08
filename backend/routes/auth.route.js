const express = require('express');
const { registerUser, loginUser, getCurrentUser, getUserProfile, updateUserProfile } = require('../controllers/auth.controller');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();


// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Login user & get token
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

module.exports = router;
