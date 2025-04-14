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


// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Admin
const getAllTransactions = asyncHandler(async (req, res) => {
  // Implementation here
  const transactions = await Transaction.find()
    .populate('user', 'name email')        // Optionally populate user details
    .populate('loan', 'amount status');    // Optionally populate loan details

  res.status(200).json({
    message: 'All transactions retrieved successfully',
    transactions,
  });
});

// @desc    Get a single transaction
// @route   GET /api/transactions/:id
// @access  Admin
const getTransactionById = asyncHandler(async (req, res) => {
  // Implementation here
  const transaction = await Transaction.findById(req.params.id)
    .populate('user', 'name email')
    .populate('loan');

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  res.status(200).json({
    message: 'Transaction fetched successfully',
    transaction,
  });
});

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Admin
const updateTransaction = asyncHandler(async (req, res) => {
  // Implementation here
  const { id } = req.params;

  // Fields allowed to be updated
  const allowedUpdates = ["amount", "type", "status", "method"];
  const updates = Object.keys(req.body);

  // Check for disallowed fields
  const isValidOperation = updates.every((key) => allowedUpdates.includes(key));
  if (!isValidOperation) {
    res.status(400);
    throw new Error("Invalid updates. Only amount, type, status, and method are allowed.");
  }

  // Find the transaction
  const transaction = await Transaction.findById(id);
  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found");
  }

  const { amount, type, status, method } = req.body;

  // Validations
  if (amount !== undefined && (!Number(amount) || amount <= 0)) {
    res.status(400);
    throw new Error("Amount must be a positive number");
  }

  if (type && !["payment", "disbursement", "refund"].includes(type)) {
    res.status(400);
    throw new Error("Invalid transaction type");
  }

  if (status && !["pending", "completed", "failed"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  if (method && !["bank", "card", "mobile_money", "cash"].includes(method)) {
    res.status(400);
    throw new Error("Invalid payment method");
  }

  // Apply updates
  updates.forEach((field) => {
    transaction[field] = req.body[field];
  });

  await transaction.save();

  res.status(200).json({
    message: "Transaction updated successfully",
    transaction,
  });
});

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Admin
const deleteTransaction = asyncHandler(async (req, res) => {
  // Implementation here
  const transactionId = req.params.id;

  const transaction = await Transaction.findById(transactionId);

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  await transaction.deleteOne();

  res.status(200).json({
    message: 'Transaction deleted successfully',
    transactionId: transactionId,
  });
});

// @desc    Get transactions by user
// @route   GET /api/transactions/user/:userId
// @access  Admin
const getTransactionsByUser = asyncHandler(async (req, res) => {
  // Implementation here
  const { userId } = req.params;

  // Find transactions linked to the user
  const transactions = await Transaction.find({ user: userId }).populate('loan');

  // If no transactions found, respond with empty array or message
  if (!transactions || transactions.length === 0) {
    res.status(404).json({ message: "No transactions found for this user" });
    return;
  }

  res.status(200).json(transactions);
});

// @desc    Get transactions by loan
// @route   GET /api/transactions/loan/:loanId
// @access  Admin & User (self)
const getTransactionsByLoan = asyncHandler(async (req, res) => {
  // Implementation here
  const { loanId } = req.params;

  // Validate loanId format
  if (!loanId.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error("Invalid loan ID");
  }

  const transactions = await Transaction.find({ loan: loanId }).populate('user', 'name email');

  if (!transactions || transactions.length === 0) {
    res.status(404);
    throw new Error('No transactions found for this loan');
  }

  res.status(200).json({
    count: transactions.length,
    transactions,
  });
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
