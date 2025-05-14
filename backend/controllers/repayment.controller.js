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

  // ✅ Convert amount to a number, validate it's positive, and round to nearest whole number
  const paymentAmount = Math.round(Number(amountPaid));
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

  // ✅ Allow payment if it matches or slightly exceeds balance (within tolerance)
  const tolerance = 1; // Allow up to 1 unit over the balance
  if (paymentAmount > loan.repaymentBalance + tolerance) {
    res.status(400);
    throw new Error(`Repayment exceeds outstanding balance. Maximum payment: ${loan.repaymentBalance}`);
  }

  // ✅ Adjust payment to not exceed balance (e.g., pay 429.8 instead of 430)
  const effectivePayment = Math.min(paymentAmount, loan.repaymentBalance);

  // ✅ Check if repayment is late based on due date
  const isLate = new Date() > new Date(dueDate);
  const status = isLate ? 'late' : 'paid';

  // ✅ Generate a unique reference ID for the repayment
  const referenceId = `RPY-${Date.now()}`;

  // ✅ Create a new repayment record
  const repayment = await Repayment.create({
    loan: loanId,
    user: userId,
    amountPaid: effectivePayment,
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
      $inc: { repaymentBalance: -effectivePayment }, // Reduce balance by effective amount
      $set: { 
        status: loan.repaymentBalance - effectivePayment <= 0 ? 'completed' : 'active', // Set new status
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



// @desc    Get all repayment records
// @route   GET /api/repayments
// @access  Private/Admin
const getAllRepayments = asyncHandler(async (req, res) => {
  // Step 1: Aggregate total paid per loan
  const totalPaidAggregation = await Repayment.aggregate([
    {
      $group: {
        _id: '$loan', // Group by loan ID
        totalPaid: { $sum: '$amountPaid' }, // Sum amountPaid for each loan
      },
    },
  ]);

  // Convert aggregation result to a lookup object for quick access
  const totalPaidMap = totalPaidAggregation.reduce((map, item) => {
    map[item._id.toString()] = Math.round(item.totalPaid || 0);
    return map;
  }, {});

  // Step 2: Fetch all repayments with populated user and loan data
  const repayments = await Repayment.find()
    .populate('user', 'name email phone') // Populate user details
    .populate('loan', 'amount loanType status repaymentBalance') // Populate loan details
    .sort({ paymentDate: -1 }) // Sort by most recent payment date
    .lean(); // Convert to plain JS objects for performance

  // Step 3: Handle case where no repayments are found
  if (!repayments || repayments.length === 0) {
    return res.status(200).json({
      message: 'No repayments found',
      total: 0,
      repayments: [],
    });
  }

  // Step 4: Create enhanced repayment records
  const enhancedRepayments = repayments.map(rep => {
    const loanId = rep.loan?._id?.toString();
    return {
      _id: rep._id,
      loan: rep.loan
        ? {
            _id: rep.loan._id,
            type: rep.loan.loanType || 'unknown',
            amount: Number(rep.loan.amount) || 0,
            status: rep.loan.status || 'unknown',
          }
        : { _id: null, type: 'unknown', amount: 0, status: 'unknown' },
      user: rep.user
        ? {
            _id: rep.user._id,
            name: rep.user.name || 'Unknown',
            email: rep.user.email || 'N/A',
            phone: rep.user.phone || 'N/A',
          }
        : { _id: null, name: 'Unknown', email: 'N/A', phone: 'N/A' },
      lastPayment: Math.round(Number(rep.amountPaid) || 0), // Current repayment amount
      totalPaidSoFar: loanId ? totalPaidMap[loanId] || 0 : 0, // Total paid for this loan
      repaymentBalance: rep.loan?.status === 'active' && rep.loan?.repaymentBalance
        ? Math.round(Number(rep.loan.repaymentBalance) || 0)
        : 0, // Balance only for active loans
      paymentMethod: rep.paymentMethod || 'N/A',
      dueDate: rep.dueDate || null,
      paymentDate: rep.paymentDate || null,
      status: rep.status || 'unknown',
      referenceId: rep.referenceId || 'N/A',
      evidence: rep.evidence || null,
    };
  });

  // Step 5: Send response with formatted repayment data
  res.status(200).json({
    message: 'Fetched all repayments successfully',
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
  const repayment = await Repayment.findById(repaymentId, { isDeleted: false })
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
  const { userId } = req.params;

  // Fetch repayments made by the specified user
  const repayments = await Repayment.find({ user: userId, isDeleted: false  })
    .populate('loan', 'amount loanType status repaymentBalance')
    .sort({ paymentDate: -1 });

  if (!repayments || repayments.length === 0) {
    res.status(404);
    throw new Error("No repayments found for this user.");
  }

  // Group repayments by loan to calculate totalPaid per loan
  const grouped = {};

  repayments.forEach(r => {
    const loanId = r.loan._id.toString();
    if (!grouped[loanId]) {
      grouped[loanId] = {
        totalPaid: 0,
        repaymentBalance: r.loan.repaymentBalance,
        loanStatus: r.loan.status,
      };
    }
    grouped[loanId].totalPaid += r.amountPaid;
  });

  // Map the response with enhanced details
  const enhanced = repayments.map(rep => {
    const group = grouped[rep.loan._id.toString()];
    return {
      _id: rep._id,
      loan: {
        _id: rep.loan._id,
        type: rep.loan.loanType,
        amount: rep.loan.amount,
        status: rep.loan.status,
      },
      lastPayment: Math.round(rep.amountPaid),
      totalPaidSoFar: Math.round(group.totalPaid),
      repaymentBalance: rep.loan.status === 'active' ? Math.round(group.repaymentBalance) : 0,
      paymentMethod: rep.paymentMethod,
      dueDate: rep.dueDate,
      paymentDate: rep.paymentDate,
      status: rep.status,
      referenceId: rep.referenceId,
      evidence: rep.evidence,
    };
  });

  res.status(200).json({
    message: "Fetched repayments for user",
    total: enhanced.length,
    repayments: enhanced,
  });
});

// @desc    Get repayments by Loan
// @route   GET /api/repayments/loan/:loanId
// @access  Admin/User
const getRepaymentsByLoan = asyncHandler(async (req, res) => {
  // Logic to get repayments for a loan
  const { loanId } = req.params;

  // Fetch repayments linked to the specified loan
  const repayments = await Repayment.find({ loan: loanId, isDeleted: false })
    .populate('user', 'name email phone')
    .populate('loan', 'amount loanType status repaymentBalance')
    .sort({ paymentDate: -1 });

  if (!repayments || repayments.length === 0) {
    res.status(404);
    throw new Error("No repayments found for this loan.");
  }

  // Calculate totalPaid for this loan
  let totalPaid = 0;
  repayments.forEach(rep => {
    totalPaid += rep.amountPaid;
  });

  // Use the loan data from the first repayment
  const loanInfo = repayments[0].loan;

  const response = {
    loan: {
      _id: loanInfo._id,
      type: loanInfo.loanType,
      amount: loanInfo.amount,
      status: loanInfo.status,
      repaymentBalance: loanInfo.status === 'active' ? Math.round(loanInfo.repaymentBalance) : 0,
    },
    totalPaid: Math.round(totalPaid),
    repayments: repayments.map(rep => ({
      _id: rep._id,
      user: {
        _id: rep.user._id,
        name: rep.user.name,
        email: rep.user.email,
        phone: rep.user.phone,
      },
      amountPaid: Math.round(rep.amountPaid),
      paymentMethod: rep.paymentMethod,
      dueDate: rep.dueDate,
      paymentDate: rep.paymentDate,
      status: rep.status,
      referenceId: rep.referenceId,
      evidence: rep.evidence,
    })),
  };

  res.status(200).json({
    message: "Fetched repayments for loan",
    ...response,
  });

});

// @desc    Update repayment
// @route   PUT /api/repayments/:id
// @access  Admin
const updateRepayment = asyncHandler(async (req, res) => {
  // Logic to update repayment (e.g., verification)
  const repaymentId = req.params.id;
  const { status, amountPaid, paymentMethod, dueDate, evidence } = req.body;

  // Find repayment by ID
  const repayment = await Repayment.findById(repaymentId, { isDeleted: false });
  if (!repayment) {
    res.status(404);
    throw new Error("Repayment not found");
  }

  // Update fields if provided
  if (status) repayment.status = status;
  if (amountPaid) repayment.amountPaid = Number(amountPaid);
  if (paymentMethod) repayment.paymentMethod = paymentMethod;
  if (dueDate) repayment.dueDate = dueDate;
  if (evidence) repayment.evidence = evidence;

  // Save updated repayment
  const updatedRepayment = await repayment.save();

  res.status(200).json({
    message: "Repayment updated successfully",
    repayment: updatedRepayment,
  });

});

// @desc    Delete repayment
// @route   DELETE /api/repayments/:id
// @access  Admin
const deleteRepayment = asyncHandler(async (req, res) => {
  // Logic to delete repayment record
  const repaymentId = req.params.id;

  // Find the repayment record
  const repayment = await Repayment.findById(repaymentId);
  if (!repayment) {
    res.status(404);
    throw new Error("Repayment not found");
  }

  // Check if already deleted
  if (repayment.isDeleted) {
    res.status(400);
    throw new Error("Repayment has already been deleted");
  }

  // Fetch the associated loan
  const loan = await Loan.findById(repayment.loan).select('+repaymentBalance');
  if (!loan) {
    res.status(404);
    throw new Error("Associated loan not found");
  }

  // Rollback repayment balance on the loan
  loan.repaymentBalance = Math.round(loan.repaymentBalance + repayment.amountPaid);

  // If loan was marked as completed before, revert it to active
  if (loan.status === 'completed') {
    loan.status = 'active';
  }

  //if payment was marked as paid before, revert it to rejected
  if(repayment.status === 'paid'){
     repayment.status = 'rejected'
  }

  // Save the loan updates
  await loan.save();

  // Soft delete the repayment
  repayment.isDeleted = true;
  repayment.status = 'rejected';
  await repayment.save();

  res.status(200).json({
    message: "Repayment deleted successfully and loan balance adjusted",
    rolledBackAmount: repayment.amountPaid,
    updatedLoanBalance: loan.repaymentBalance,
  });
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
