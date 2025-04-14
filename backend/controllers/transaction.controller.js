const asyncHandler = require("express-async-handler");
const Transaction = require("../models/transactions.model");
const Loan = require("../models/loan.model");
const errorHandler = require("../middleware/errorHanlerMiddleware");


// @desc    Create a transaction
// @route   POST /api/transactions
// @access  Admin
  // Implementation here
  const createTransaction = asyncHandler(async (req, res) => {
    const { user, loan, amount, type, method, loanId } = req.body;

    // Validate required fields
    if (!user || !loan || !amount || !type || !method) {
      res.status(400);
      throw new Error("All required fields must be provided.");
    }
  
    // Optional: Check if the loan exists
    const loanExists = await Loan.findById(loan);
    if (!loanExists) {
      res.status(404);
      throw new Error("Loan not found");
    }
  
    // Prevent loan approval if the loan status is already approved or active
    if (loanExists.status === 'approved' || loanExists.status === 'active') {
      res.status(400);
      throw new Error("This loan has already been approved or is already active.");
    }
  
    // Check if the transaction is a disbursement and if the amount matches the loan amount
    if (type === 'disbursement') {
      if (amount !== loanExists.amount) {
        res.status(400);
        throw new Error(`Disbursement amount must be exactly ${loanExists.amount}`);
      }
  
      // Update loan status to 'active' after successful disbursement
      loanExists.status = 'active';
      await loanExists.save();
    }
  
    // Define status based on transaction type
    const statusMap = {
      disbursement: "completed", // Disbursement assumed to be immediate
      payment: "pending", // Payment might need verification
      refund: "pending", // Refund may need approval
    };
  
    const status = statusMap[type] || "pending";
  
    // Generate a unique reference ID
    const referenceId = `TXN-${Date.now()}`;
  
    const newTransaction = await Transaction.create({
      user,
      loan,
      amount,
      type,
      method,
      referenceId,
      status,
      loanId
    });
  
    res.status(201).json({
      message: "Transaction created successfully",
      transaction: newTransaction,
    });
  
  errorHandler
  });

  module.exports = { createTransaction };


// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Admin
const getAllTransactions = asyncHandler(async (req, res) => {
  // Implementation here
});

// @desc    Get a single transaction
// @route   GET /api/transactions/:id
// @access  Admin
const getTransactionById = asyncHandler(async (req, res) => {
  // Implementation here
});

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Admin
const updateTransaction = asyncHandler(async (req, res) => {
  // Implementation here
});

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Admin
const deleteTransaction = asyncHandler(async (req, res) => {
  // Implementation here
});

// @desc    Get transactions by user
// @route   GET /api/transactions/user/:userId
// @access  Admin
const getTransactionsByUser = asyncHandler(async (req, res) => {
  // Implementation here
});

// @desc    Get transactions by loan
// @route   GET /api/transactions/loan/:loanId
// @access  Admin & User (self)
const getTransactionsByLoan = asyncHandler(async (req, res) => {
  // Implementation here
});

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionsByUser,
  getTransactionsByLoan,
};
