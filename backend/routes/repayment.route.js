// routes/repayment.routes.js

const express = require('express');
const router = express.Router();
const {
  createRepayment,
  getAllRepayments,
  getRepaymentById,
  getRepaymentsByUser,
  getRepaymentsByLoan,
  updateRepayment,
  deleteRepayment,
} = require('../controllers/repayment.controller');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   POST /api/repayments
// @desc    User creates a repayment (make payment)
// @access  User
router.post('/', protect, createRepayment);

// @route   GET /api/repayments
// @desc    Get all repayments
// @access  Admin
router.get('/',protect, adminOnly, getAllRepayments);

// @route   GET /api/repayments/:id
// @desc    Get repayment by ID
// @access  Admin/User (owner only)
router.get('/:id', protect, getRepaymentById);

// @route   GET /api/repayments/user/:userId
// @desc    Get repayments by user ID
// @access  Admin/User (owner only)
router.get('/user/:userId', protect, getRepaymentsByUser);

// @route   GET /api/repayments/loan/:loanId
// @desc    Get repayments by loan ID
// @access  Admin/User (loan owner)
router.get('/loan/:loanId', protect, getRepaymentsByLoan);

// @route   PUT /api/repayments/:id
// @desc    Update repayment (e.g. admin verification)
// @access  Admin
router.put('/:id', protect, adminOnly, updateRepayment);

// @route   DELETE /api/repayments/:id
// @desc    Delete repayment record
// @access  Admin
router.delete('/:id', protect, adminOnly, deleteRepayment);

module.exports = router;
