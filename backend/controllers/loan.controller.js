const asyncHandler = require("express-async-handler");
const Loan = require("../models/loan.model");

// @desc    Get all loans
// @route   GET /api/loans
// @access  Protected (User/Admin)
const getAllLoans = asyncHandler(async (req, res) => {
  // Check if the logged-in user is an admin
  if (!req.user || req.user.role !== 'admin') {
    res.status(403); // Forbidden
    throw new Error('Not authorized to access all loans');
  }

  // Fetch all loans, including user name & email, sorted by latest
  const loans = await Loan.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  // Return loans to admin
  res.status(200).json(loans);

});

// @desc    Get a loan by ID
// @route   GET /api/loans/:id
// @access  Protected
const getLoanById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Implement your logic here to retrieve the loan by its ID
  res.status(200).json({ message: `Get loan by ID: ${id}` });
});

// @desc    Create a new loan
// @route   POST /api/loans
// @access  Protected/Admin
const createLoan = asyncHandler(async (req, res) => {
  const { amount, interestRate, termMonths, loanType } = req.body;

  // Check if user is an admin
  if (!req.user || req.user.role !== "admin") {
    res.status(403); // Forbidden
    throw new Error("Not authorized to create a loan");
  }

  // Validate required fields
  if (!amount || !interestRate || !termMonths || !loanType) {
    res.status(400);
    throw new Error("Please provide all required loan fields");
  }

  const monthlyInterestRate = interestRate / 100 / 12;

  const monthlyPayment = (
    (amount * monthlyInterestRate) /
    (1 - Math.pow(1 + monthlyInterestRate, -termMonths))
  ).toFixed(2);

  const totalRepayable = (monthlyPayment * termMonths).toFixed(2);

  const loan = await Loan.create({
    user: req.user._id, // Automatically assign to the logged-in admin
    amount,
    loanType,
    interestRate,
    termMonths,
    monthlyPayment,
    totalRepayable,
    status: "pending",
  });

  res.status(201).json(loan);
});

// @desc    Update a loan
// @route   PUT /api/loans/:id
// @access  Protected (Admin or Owner)
const updateLoan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Implement your logic here to update the loan with the given ID
  res.status(200).json({ message: `Loan updated successfully: ${id}` });
});

// @desc    Delete a loan
// @route   DELETE /api/loans/:id
// @access  Protected/Admin
const deleteLoan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Implement your logic here to delete the loan with the given ID
  res.status(200).json({ message: `Loan deleted successfully: ${id}` });
});

// @desc    Update loan status
// @route   PUT /api/loans/:id/status
// @access  Protected
const updateLoanStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Implement your logic here to update the status of the loan (e.g., approved, completed)
  res.status(200).json({ message: `Loan status updated successfully: ${id}` });
});

// @desc    Get admin dashboard loan data
// @route   GET /api/loans/dashboard-data
// @access  Protected/Admin
const getAdminLoanDashboard = asyncHandler(async (req, res) => {
  // Implement your logic to gather dashboard data for admin
  res.status(200).json({ message: "Admin loan dashboard data" });
});

// @desc    Get user-specific loan dashboard data
// @route   GET /api/loans/user-dashboard-data
// @access  Protected
const getUserLoanDashboard = asyncHandler(async (req, res) => {
  // Implement your logic to gather loan data specific to the logged in user
  res.status(200).json({ message: "User loan dashboard data" });
});

module.exports = {
  getAllLoans,
  getLoanById,
  createLoan,
  updateLoan,
  deleteLoan,
  updateLoanStatus,
  getAdminLoanDashboard,
  getUserLoanDashboard,
};
