const asyncHandler = require("express-async-handler");

// @desc    Create a transaction
// @route   POST /api/transactions
// @access  Admin
const createTransaction = asyncHandler(async (req, res)=> {
    // Implementation here
});
  
  // @desc    Get all transactions
  // @route   GET /api/transactions
  // @access  Admin
  const getAllTransactions =  asyncHandler(async (req, res)=> {
    // Implementation here
});
  
  // @desc    Get a single transaction
  // @route   GET /api/transactions/:id
  // @access  Admin
  const getTransactionById =  asyncHandler(async (req, res)=> {
    // Implementation here
});
  
  // @desc    Update a transaction
  // @route   PUT /api/transactions/:id
  // @access  Admin
  const updateTransaction =  asyncHandler(async (req, res)=> {
    // Implementation here
});
  
  // @desc    Delete a transaction
  // @route   DELETE /api/transactions/:id
  // @access  Admin
  const deleteTransaction =  asyncHandler(async (req, res)=> {
    // Implementation here
});
  
  // @desc    Get transactions by user
  // @route   GET /api/transactions/user/:userId
  // @access  Admin
  const getTransactionsByUser = asyncHandler(async (req, res)=> {
    // Implementation here
});
  
  // @desc    Get transactions by loan
  // @route   GET /api/transactions/loan/:loanId
  // @access  Admin & User (self)
  const getTransactionsByLoan =  asyncHandler(async (req, res)=> {
    // Implementation here
});
  
  module.exports = {
    createTransaction,
    getAllTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getTransactionsByUser,
    getTransactionsByLoan
  };
  