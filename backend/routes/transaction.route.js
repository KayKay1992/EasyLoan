const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionsByUser,
  getTransactionsByLoan
} = require('../controllers/transaction.controller');

// Middleware (assumed)
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   POST /api/transactions
// @access  Admin - Create a new transaction (e.g. disbursement)
router.post('/', protect, adminOnly, createTransaction);

// @route   GET /api/transactions
// @access  Admin - Get all transactions
router.get('/', protect, adminOnly, getAllTransactions);

// @route   GET /api/transactions/:id
// @access  Admin - View single transaction by ID
router.get('/:id', protect, adminOnly, getTransactionById);

// @route   PUT /api/transactions/:id
// @access  Admin - Update a transaction
router.put('/:id', protect, adminOnly, updateTransaction);

// @route   DELETE /api/transactions/:id
// @access  Admin - Delete a transaction
router.delete('/:id', protect, adminOnly, deleteTransaction);

// @route   GET /api/transactions/user/:userId
// @access  Admin - Get transactions for a specific user
router.get('/user/:userId', protect, adminOnly, getTransactionsByUser);

// @route   GET /api/transactions/loan/:loanId
// @access  Admin & User (for own loan) - Get transactions for a specific loan
router.get('/loan/:loanId', protect, getTransactionsByLoan);

module.exports = router;
