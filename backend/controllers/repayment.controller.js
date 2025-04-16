// controllers/repayment.controller.js

const asyncHandler = require('express-async-handler');
const Repayment = require('../models/repayment.model'); // Uncomment if model is ready
const Loan = require('../models/loan.model');

// @desc    Create a new repayment
// @route   POST /api/repayments
// @access  User
const createRepayment = asyncHandler(async (req, res) => {
// Destructure necessary fields from request body and authenticated user
const { loanId, amountPaid, paymentMethod, dueDate } = req.body;
const userId = req.user._id;

// ✅ Validate required input fields
if (!loanId || !amountPaid || !paymentMethod || !dueDate) {
  res.status(400);
  throw new Error("All fields (loanId, amountPaid, paymentMethod, dueDate) are required");
}

// ✅ Convert amount to a number and validate it's a positive number
const paymentAmount = Number(amountPaid);
if (isNaN(paymentAmount) || paymentAmount <= 0) {
  res.status(400);
  throw new Error("Invalid payment amount");
}

// ✅ Get path to uploaded repayment evidence if available
const evidencePath = req.file?.path || null;

// ✅ Find the loan document and select the repaymentBalance field explicitly
const loan = await Loan.findById(loanId).select('+repaymentBalance');
if (!loan) {
  res.status(404);
  throw new Error("Loan not found");
}

// ✅ Ensure the user trying to repay is the owner of the loan
if (loan.user.toString() !== userId.toString()) {
  res.status(403);
  throw new Error("You are not authorized to repay this loan");
}

// ✅ Only allow repayment if the loan is active
if (loan.status !== 'active') {
  res.status(400);
  throw new Error("Repayment is only allowed for active loans");
}

// ✅ Check that the loan has a valid repayment balance
if (typeof loan.repaymentBalance !== 'number' || loan.repaymentBalance < 0) {
  res.status(500);
  throw new Error("Invalid repayment balance on loan record");
}

// ✅ Prevent overpayment beyond the outstanding balance
if (paymentAmount > loan.repaymentBalance) {
  res.status(400);
  throw new Error(`Repayment exceeds outstanding balance. Maximum payment: ${loan.repaymentBalance}`);
}

// ✅ Check if repayment is late based on due date
const isLate = new Date() > new Date(dueDate);
const status = isLate ? 'late' : 'paid';

// ✅ Generate a unique reference ID for the repayment
const referenceId = `RPY-${Date.now()}`;

// ✅ Create a new repayment record
const repayment = await Repayment.create({
  loan: loanId,
  user: userId,
  amountPaid: paymentAmount,
  paymentMethod,
  dueDate,
  paymentDate: new Date(),
  status,
  referenceId,
  evidence: evidencePath,
});

// ✅ Update loan: reduce repaymentBalance and possibly mark loan as completed
const updatedLoan = await Loan.findByIdAndUpdate(
  loanId,
  {
    $inc: { repaymentBalance: -Math.round(paymentAmount) }, // Reduce balance (whole number)
    $set: { 
      status: loan.repaymentBalance - paymentAmount <= 0 ? 'completed' : 'active', // Set new status
      lastRepaymentDate: new Date() // Track latest repayment
    }
  },
  { new: true }
).select('repaymentBalance status'); // Return only what's needed

// ✅ Respond with repayment details and updated loan balance/status
res.status(201).json({
  message: "Repayment successful",
  repayment,
  repaymentBalance: Math.round(updatedLoan.repaymentBalance), // Round off the balance in response
  loanStatus: updatedLoan.status,
});
});




// @desc    Get all repayments
// @route   GET /api/repayments
// @access  Admin
const getAllRepayments = asyncHandler(async (req, res) => {
  // Fetch all repayment records and populate user and loan details
  const repayments = await Repayment.find()
    .populate('user', 'name email phone')
    .populate('loan', 'amount loanType status repaymentBalance user')
    .sort({ paymentDate: -1 }); // Sort repayments by most recent first

  // Group repayments by loan ID to track total paid and repayment balance
  const grouped = {};

  repayments.forEach(r => {
    const loanId = r.loan._id.toString();
    if (!grouped[loanId]) {
      grouped[loanId] = {
        totalPaid: 0, // Initialize total paid for this loan
        repaymentBalance: r.loan.repaymentBalance, // Store repayment balance
        loanStatus: r.loan.status, // Track loan status
      };
    }
    grouped[loanId].totalPaid += r.amountPaid; // Accumulate amount paid per loan
  });

  // Create enhanced repayment records with summarized and formatted data
  const enhancedRepayments = repayments.map(rep => {
    const group = grouped[rep.loan._id.toString()];
    return {
      _id: rep._id,
      loan: {
        _id: rep.loan._id,
        type: rep.loan.loanType,
        amount: rep.loan.amount,
        status: rep.loan.status,
      },
      user: {
        _id: rep.user._id,
        name: rep.user.name,
        email: rep.user.email,
        phone: rep.user.phone,
      },
      lastPayment: Math.round(rep.amountPaid), // Round off current repayment amount
      totalPaidSoFar: Math.round(group.totalPaid), // Round total paid so far for loan
      repaymentBalance: rep.loan.status === 'active' 
        ? Math.round(group.repaymentBalance) 
        : 0, // Only return balance if loan is active
      paymentMethod: rep.paymentMethod,
      dueDate: rep.dueDate,
      paymentDate: rep.paymentDate,
      status: rep.status,
      referenceId: rep.referenceId,
      evidence: rep.evidence,
    };
  });

  // Send formatted response with all repayment data
  res.status(200).json({
    message: "Fetched all repayments",
    total: enhancedRepayments.length,
    repayments: enhancedRepayments,
  });
});


// @desc    Get repayment by ID
// @route   GET /api/repayments/:id
// @access  Admin/User
const getRepaymentById = asyncHandler(async (req, res) => {
  // Logic to fetch repayment by ID
  const repaymentId = req.params.id;

  // Find repayment by ID and populate associated user and loan
  const repayment = await Repayment.findById(repaymentId)
    .populate('user', 'name email phone')
    .populate('loan', 'amount loanType status repaymentBalance');

  // If not found, return 404
  if (!repayment) {
    res.status(404);
    throw new Error("Repayment not found");
  }

  // Build the response payload
  const response = {
    _id: repayment._id,
    loan: {
      _id: repayment.loan._id,
      type: repayment.loan.loanType,
      amount: repayment.loan.amount,
      status: repayment.loan.status,
    },
    user: {
      _id: repayment.user._id,
      name: repayment.user.name,
      email: repayment.user.email,
      phone: repayment.user.phone,
    },
    amountPaid: Math.round(repayment.amountPaid),
    repaymentBalance: repayment.loan.status === 'active' 
      ? Math.round(repayment.loan.repaymentBalance) 
      : 0,
    paymentMethod: repayment.paymentMethod,
    dueDate: repayment.dueDate,
    paymentDate: repayment.paymentDate,
    status: repayment.status,
    referenceId: repayment.referenceId,
    evidence: repayment.evidence,
  };

  // Send the response
  res.status(200).json({
    message: "Fetched repayment by ID",
    repayment: response,
  });
});

// @desc    Get repayments by User
// @route   GET /api/repayments/user/:userId
// @access  Admin/User
const getRepaymentsByUser = asyncHandler(async (req, res) => {
  // Logic to get repayments by user ID
  res.status(200).json({ message: "Fetched repayments for user" });
});

// @desc    Get repayments by Loan
// @route   GET /api/repayments/loan/:loanId
// @access  Admin/User
const getRepaymentsByLoan = asyncHandler(async (req, res) => {
  // Logic to get repayments for a loan
  res.status(200).json({ message: "Fetched repayments for loan" });
});

// @desc    Update repayment
// @route   PUT /api/repayments/:id
// @access  Admin
const updateRepayment = asyncHandler(async (req, res) => {
  // Logic to update repayment (e.g., verification)
  res.status(200).json({ message: "Repayment updated successfully" });
});

// @desc    Delete repayment
// @route   DELETE /api/repayments/:id
// @access  Admin
const deleteRepayment = asyncHandler(async (req, res) => {
  // Logic to delete repayment record
  res.status(200).json({ message: "Repayment deleted successfully" });
});

module.exports = {
  createRepayment,
  getAllRepayments,
  getRepaymentById,
  getRepaymentsByUser,
  getRepaymentsByLoan,
  updateRepayment,
  deleteRepayment,
};
