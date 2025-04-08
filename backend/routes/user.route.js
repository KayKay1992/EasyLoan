const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  deleteUser,
} = require('../controllers/user.controller');

const { protect, adminOnly } = require('../middleware/authMiddleware');




// Admin routes And Private
router.get('/', protect, adminOnly, getUsers); // Get all users
router.get('/:id', protect, getUserById); // Get user by ID
// router.put('/:id', protect, adminOnly, updateUser); // Update user by ID
router.delete('/:id', protect, adminOnly, deleteUser); // Delete user by ID

module.exports = router;
