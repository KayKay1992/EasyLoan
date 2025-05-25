const asyncHandler = require("express-async-handler");
const Loan = require("../models/loan.model");
const User = require("../models/user.model");
const { default: mongoose } = require("mongoose");

// @desc    Get all loans
// @route   GET /api/loans
// @access  Protected (User/Admin)
// Get all applied loans (Admin only)
// Get all applied loans (Admin only)
const getAllLoans = asyncHandler(async (req, res) => {
  // Check if the logged-in user is an admin
  if (!req.user || req.user.role !== "admin") {
    console.log(
      `Unauthorized attempt to access all loans by user: ${
        req.user?._id || "unknown"
      }`
    );
    res.status(403);
    throw new Error("Not authorized to access loan data");
  }

  // Extract query parameters for pagination and filtering
  const { page = 1, limit = 10, status } = req.query;
  const query = {};

  // Add status filter if provided
  if (status) {
    query.status = status; // Assumes Loan model has a 'status' field
  }

  // Calculate pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  try {
    // Fetch loans with pagination, population, and sorting
    const loans = await Loan.find(query)
      .populate("user", "name") // Only populate 'name' to minimize data exposure
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(); // Use lean() for better performance (returns plain JS objects)

    // Get total count for pagination metadata
    const totalLoans = await Loan.countDocuments(query);

    // Log the admin action
    console.log(
      `Admin ${req.user._id} fetched ${loans.length} loans (page: ${pageNum}, limit: ${limitNum})`
    );

    // Return loans with pagination metadata
    res.status(200).json({
      success: true,
      data: loans,
      meta: {
        total: totalLoans,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalLoans / limitNum),
      },
    });
  } catch (error) {
    console.error(
      `Error fetching loans for admin ${req.user._id}: ${error.message}`
    );
    res.status(500);
    throw new Error("Server error while fetching loans");
  }
});
/**
 * @desc    Get all loans for a specific user
 * @route   GET /api/loans/:userId
 * @access  Private
 */
const getUserLoans = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  console.log("Received request for loans, userId:", userId); // Debug

  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
    console.log("Invalid userId format:", userId);
    res.status(400);
    throw new Error("Invalid user ID format");
  }

  const user = await User.findById(userId).select("_id");
  if (!user) {
    console.log("User not found:", userId);
    res.status(404);
    throw new Error("User not found");
  }

  const loans = await Loan.find({ user: userId })
    .select("amount status createdAt updatedAt documents")
    .lean();

  console.log("Loans fetched:", loans);

  res.status(200).json({
    success: true,
    data: loans,
  });
});

const getLoansByUser = asyncHandler(async (req, res) => {
  // Authorization check
  const requestedUserId = req.params.userId;
  
  if (!req.user || (req.user._id.toString() !== requestedUserId && req.user.role !== "admin")) {
    console.log(`Unauthorized attempt by: ${req.user?._id || "unknown"}`);
    res.status(403);
    throw new Error("Not authorized to access this user's loan data");
  }

  // Extract query parameters
  const { page = 1, limit = 10, status } = req.query;
  const query = { user: requestedUserId };

  if (status) {
    query.status = status;
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  try {
    // Fetch loans with processing
    let loans = await Loan.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Process each loan
    loans = await Promise.all(loans.map(async (loan) => {
      let needsUpdate = false;
      const updateFields = {};

      // Calculate endDate if loan is active and endDate doesn't exist
      if (loan.status === 'active' && !loan.endDate && loan.createdAt && loan.termMonths) {
        const endDate = new Date(loan.createdAt);
        endDate.setMonth(endDate.getMonth() + loan.termMonths);
        updateFields.endDate = endDate;
        needsUpdate = true;
      }

      // Check for defaulted loans
      if (loan.status === 'active' && loan.endDate && new Date(loan.endDate) < new Date()) {
        // Replace with your actual payment verification logic
        const isUnpaid = true; 
        
        if (isUnpaid) {
          updateFields.status = 'defaulted';
          updateFields.defaultedAt = new Date();
          needsUpdate = true;
        }
      }

      // Update loan if needed
      if (needsUpdate) {
        const updatedLoan = await Loan.findByIdAndUpdate(
          loan._id,
          updateFields,
          { new: true }
        ).lean();
        return updatedLoan;
      }

      return loan;
    }));

    // Get total count
    const totalLoans = await Loan.countDocuments(query);

    res.status(200).json({
      success: true,
      data: loans,
      meta: {
        total: totalLoans,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalLoans / limitNum),
      },
    });
  } catch (error) {
    console.error(`Error fetching loans: ${error.message}`);
    res.status(500);
    throw new Error("Server error while fetching user loans");
  }
});
// @desc    Get a loan by ID
// @route   GET /api/loans/:id
// @access  Protected
const getLoanById = asyncHandler(async (req, res) => {
  const { id } = req.params;


  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid loan ID format');
  }
  try{
     // Find the loan by its ID and populate user name and email
  const loan = await Loan.findById(id).populate("user", "name email");

  // If loan not found, return 404 error
  if (!loan) {
    res.status(404);
    throw new Error("Loan not found");
  }

  // Return the found loan
  res.status(200).json(loan);
  } catch (error) {
    console.error('Error in getLoanById:', error);
    res.status(500);
    throw new Error('Server error while fetching loan');
  }
 
});

// @desc    Admin creates loan template (not assigned to user)
// @route   POST /api/loan-templates
// @access  Admin

// Assumes you're using Multer middleware on the route to handle 'document' field
const createLoan = asyncHandler(async (req, res) => {
  const { amount, interestRate, termMonths, loanType } = req.body;

  // Authorization: Only admins can create loan offers
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Only admins are allowed to create loan offers");
  }

  // Validation: All fields are required
  if (!amount || !interestRate || !termMonths || !loanType) {
    res.status(400);
    throw new Error(
      "All fields (amount, interestRate, termMonths, loanType) are required"
    );
  }

  const parsedAmount = parseFloat(amount);
  const parsedInterestRate = parseFloat(interestRate);
  const parsedTermMonths = parseInt(termMonths, 10);

  // Validate numeric fields
  if (
    isNaN(parsedAmount) ||
    isNaN(parsedInterestRate) ||
    isNaN(parsedTermMonths)
  ) {
    res.status(400);
    throw new Error("Amount, interest rate, and term must be valid numbers");
  }

  // Check for uploaded file (optional)
  let documentUrl = null;
  if (req.file) {
    // You can customize this logic to save file buffer, path, or upload to cloud storage
    documentUrl = req.file.originalname; // or req.file.path if using diskStorage
  }

  // Create the loan offer
  const loan = await Loan.create({
    loanType,
    amount: parsedAmount,
    interestRate: parsedInterestRate,
    termMonths: parsedTermMonths,
    createdBy: req.user._id,
    isOffer: true, // Mark as a loan offer
    documents: documentUrl, // Optional: Save file name or path
  });

  res.status(201).json({
    message: "Loan offer created successfully",
    loan,
  });
});

// @desc    Reject a loan application
// @route   PATCH /api/loans/reject/:id
// @access  Admin only
const rejectLoan = asyncHandler(async (req, res) => {
  const loanId = req.params.id;

  // Only admin can reject loans
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to reject loans");
  }

  const loan = await Loan.findById(loanId);
  if (!loan) {
    res.status(404);
    throw new Error("Loan not found");
  }

  // Prevent rejecting already completed or rejected loans
  if (["completed", "rejected"].includes(loan.status)) {
    res.status(400);
    throw new Error(`Loan is already ${loan.status}`);
  }

  loan.status = "rejected";
  await loan.save();

  res.status(200).json({ message: "Loan rejected successfully", loan });
});

// Get all loan offers (accessible to all users)
const getLoanOffer = asyncHandler(async (req, res) => {
  // Extract query parameters for pagination and filtering
  const { page = 1, limit = 10, loanType } = req.query;
  const query = { isOffer: true }; // Only fetch loan offers

  // Add loanType filter if provided
  if (loanType) {
    query.loanType = loanType; // Assumes Loan model has a 'loanType' field
  }

  // Calculate pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  try {
    // Fetch loan offers with pagination and sorting
    const loans = await Loan.find(query)
      .select("loanType amount interestRate termMonths documents") // Exclude sensitive fields like createdBy
      .sort({ createdAt: -1 }) // Latest offers first
      .skip(skip)
      .limit(limitNum)
      .lean(); // Use lean() for better performance

    // Get total count for pagination metadata
    const totalLoans = await Loan.countDocuments(query);

    // Log the action for debugging (optional)
    console.log(
      `Fetched ${loans.length} loan offers (page: ${pageNum}, limit: ${limitNum})`
    );

    // Return loan offers with pagination metadata
    res.status(200).json({
      success: true,
      data: loans,
      meta: {
        total: totalLoans,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalLoans / limitNum),
      },
    });
  } catch (error) {
    console.error(`Error fetching loan offers: ${error.message}`);
    res.status(500);
    throw new Error("Server error while fetching loan offers");
  }
});

// Get a single loan offer by ID (accessible to all users)
const getLoanOfferById = asyncHandler(async (req, res) => {
  const { id } = req.params; // Get the loan offer ID from URL parameters

  try {
    // Find the loan offer by ID and ensure it's marked as an offer
    const loanOffer = await Loan.findOne({
      _id: id,
      isOffer: true
    })
    .select("loanType amount interestRate termMonths documents description eligibilityCriteria") // Select fields to return
    .lean(); // Convert to plain JavaScript object

    // If no loan offer found with that ID
    if (!loanOffer) {
      res.status(404);
      throw new Error("Loan offer not found");
    }

    // Log the action for debugging (optional)
    console.log(`Fetched loan offer with ID: ${id}`);

    // Return the loan offer
    res.status(200).json({
      success: true,
      data: loanOffer
    });
  } catch (error) {
    console.error(`Error fetching loan offer with ID ${id}: ${error.message}`);
    
    // Handle CastError (invalid ID format)
    if (error.name === 'CastError') {
      res.status(400);
      throw new Error("Invalid loan offer ID format");
    }
    
    // Pass other errors to the error handler
    res.status(error.statusCode || 500);
    throw error;
  }
});

// @desc    Update a loan
// @route   PUT /api/loans/:id
// @access  Protected (Admin or Owner)
const updateLoan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find the loan by ID
  const loan = await Loan.findById(id);

  if (!loan) {
    res.status(404);
    throw new Error("Loan not found");
  }

  // Authorization check (unchanged)
  if (
    req.user.role !== "admin" &&
    loan.user.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to update this loan");
  }

  // Extract fields from FormData
  const amount = req.body.amount ? Number(req.body.amount) : loan.amount;
  const interestRate = req.body.interestRate
    ? Number(req.body.interestRate)
    : loan.interestRate;
  const termMonths = req.body.termMonths
    ? Number(req.body.termMonths)
    : loan.termMonths;
  const loanType = req.body.loanType || loan.loanType;

  // Handle file upload if present
  if (req.file) {
    loan.document = req.file.path; // Adjust based on your file handling
  }

  // Update fields
  const updatedFields = {
    amount,
    interestRate,
    termMonths,
    loanType,
    status: req.body.status || loan.status,
    // ... other fields
  };

  // Recalculate payments if financial fields changed
  if (req.body.amount || req.body.interestRate || req.body.termMonths) {
    const monthlyInterestRate = interestRate / 100 / 12;
    updatedFields.monthlyPayment = (
      (amount * monthlyInterestRate) /
      (1 - Math.pow(1 + monthlyInterestRate, -termMonths))
    ).toFixed(2);
    updatedFields.totalRepayable = (
      updatedFields.monthlyPayment * termMonths
    ).toFixed(2);
  }

  // Apply updates
  Object.assign(loan, updatedFields);
  const updatedLoan = await loan.save();

  res.status(200).json(updatedLoan);
});
// @desc    Delete a loan
// @route   DELETE /api/loans/:id
// @access  Protected/Admin
const deleteLoan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find the loan by its ID
  const loan = await Loan.findById(id);

  // If loan not found, return error
  if (!loan) {
    res.status(404);
    throw new Error("Loan not found");
  }

  // Only admin can delete a loan
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to delete this loan");
  }

  // Delete the loan
  await loan.deleteOne();

  // Send success response
  res.status(200).json({ message: `Loan deleted successfully: ${id}` });
});

// @desc    Delete a loan offer
// @route   DELETE /api/loan-offer/:id
// @access  Private/Admin
const deleteLoanOffer = async (req, res) => {
  try {
    const loan = await Loan.findByIdAndDelete(req.params.id); // Check model name
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    res.status(200).json({ message: "Loan deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete loan" });
  }
};

// @desc    Update loan status
// @route   PUT /api/loans/:id/status
// @access  Protected
const updateLoanStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Valid statuses allowed in the loan schema
  const validStatuses = [
    "pending",
    "approved",
    "rejected",
    "active",
    "completed",
  ];

  // Check if provided status is valid
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid loan status");
  }

  // Find the loan by ID
  const loan = await Loan.findById(id);

  // If not found, return an error
  if (!loan) {
    res.status(404);
    throw new Error("Loan not found");
  }

  // Only admin can update loan status
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to update loan status");
  }

  // Update the loan status
  loan.status = status;

  // Optionally, set start and end dates for 'active' or 'completed' statuses
  if (status === "active") {
    loan.startDate = new Date();
  } else if (status === "completed") {
    loan.endDate = new Date();
  }

  const updatedLoan = await loan.save();

  // Send updated loan as response
  res.status(200).json(updatedLoan);
});

// @desc    Get admin dashboard loan data
// @route   GET /api/loans/dashboard-data
// @access  Protected/Admin
const getAdminLoanDashboard = asyncHandler(async (req, res) => {
  try {
    // Only consider user-applied loans (not templates)
    const filter = { isOffer: false };

    // 1. FETCH BASIC STATISTICS
    const totalLoans = await Loan.countDocuments(filter);
    const pendingLoans = await Loan.countDocuments({
      ...filter,
      status: "pending",
    });
    const approvedLoans = await Loan.countDocuments({
      ...filter,
      status: "approved",
    });
    const activeLoans = await Loan.countDocuments({
      ...filter,
      status: "active",
    });
    const completedLoans = await Loan.countDocuments({
      ...filter,
      status: "completed",
    });
    const defaultedLoans = await Loan.countDocuments({
      ...filter,
      status: "defaulted",
    });

    // 2. LOAN DISTRIBUTION BY STATUS
    const loanStatuses = [
      "pending",
      "approved",
      "active",
      "completed",
      "rejected",
      "defaulted",
    ];

    const loanDistributionRaw = await Loan.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const loanDistribution = loanStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "");
      acc[formattedKey] =
        loanDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    loanDistribution["All"] = totalLoans;

    // 3. LOAN TYPES DISTRIBUTION
    const loanTypes = [
      "personal",
      "business",
      "student",
      "mortgage",
      "car loan",
      "quickie loan",
    ];

    const loanTypeLevelsRaw = await Loan.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$loanType",
          count: { $sum: 1 },
        },
      },
    ]);

    const loanTypeLevels = loanTypes.reduce((acc, type) => {
      acc[type] =
        loanTypeLevelsRaw.find((item) => item._id === type)?.count || 0;
      return acc;
    }, {});

    // 4. RECENT LOANS
    const recentLoans = await Loan.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .select("amount loanType status createdAt user");

    // 5. RETURN DASHBOARD DATA
    res.status(200).json({
      statistics: {
        totalLoans,
        pendingLoans,
        approvedLoans,
        activeLoans,
        completedLoans,
        defaultedLoans,
      },
      charts: {
        loanDistribution,
        loanTypeLevels,
      },
      recentLoans,
    });
  } catch (error) {
    console.error("Admin loan dashboard error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
});

// @desc    Get user-specific loan dashboard data
// @route   GET /api/loans/user-dashboard-data
// @access  Protected
const getUserLoanDashboard = asyncHandler(async (req, res) => {
  // Get the authenticated user's ID from the request
  const userId = req.user._id;

  // 1. FETCH LOAN DISTRIBUTION BY STATUS
  const statusCounts = await Loan.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  // Convert to object format with all possible statuses
  const statuses = ["active", "approved", "completed", "defaulted", "pending", "rejected"];
  const loanDistribution = statusCounts.reduce((acc, { _id, count }) => {
    acc[_id] = count;
    return acc;
  }, {});

  // Ensure all statuses are included (even with 0 count)
  statuses.forEach(status => {
    if (!loanDistribution.hasOwnProperty(status)) {
      loanDistribution[status] = 0;
    }
  });

  // Calculate total loans count
  loanDistribution.All = Object.values(loanDistribution).reduce((a, b) => a + b, 0);

  // 2. LOAN TYPES DISTRIBUTION
  const loanTypes = [
    "personal",
    "business",
    "student",
    "mortgage",
    "car loan",
    "quickie loan"
  ];

  // Get raw count of loans grouped by type
  const loanTypesRaw = await Loan.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: "$loanType",
        count: { $sum: 1 }
      }
    }
  ]);

  // Transform data to include all loan types (even with 0 count)
  const loanTypeLevels = loanTypes.reduce((acc, type) => {
    acc[type] = loanTypesRaw.find(item => item._id === type)?.count || 0;
    return acc;
  }, {});

  // 3. RECENT LOANS
  const recentLoans = await Loan.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("user amount loanType status createdAt");

  // 4. RETURN DATA IN FORMAT EXPECTED BY FRONTEND
  res.status(200).json({
    charts: {
      loanDistribution,
      loanTypeLevels
    },
    recentLoans: recentLoans
  });
});

const applyForLoan = asyncHandler(async (req, res) => {
  try {
    // Log incoming request
    console.log('Received loan application:', {
      body: req.body,
      file: req.file ? req.file.path : 'No file uploaded',
      fields: Object.keys(req.body)
    });

    // Validate authentication
    if (!req.user || !req.user._id) {
      console.error('Authentication error: req.user is undefined');
      return res.status(401).json({
        message: 'Unauthorized: Please log in to apply for a loan'
      });
    }

    const {
      amount,
      duration,
      reason,
      loanType,
      interestRate,
      monthlyPayment,
      totalRepayable,
      bankName,
      accountName,
      accountNumber,
      BVN,
      phone,
      email
    } = req.body;

    // Validate required fields
    const requiredFields = {
      amount,
      duration,
      reason,
      loanType,
      interestRate,
      monthlyPayment,
      totalRepayable,
      bankName,
      accountName,
      accountNumber,
      BVN,
      phone,
      email
    };
    const missingFields = Object.keys(requiredFields).filter(
      key => requiredFields[key] === undefined || requiredFields[key] === ''
    );
    if (missingFields.length > 0) {
      console.error('Missing fields:', missingFields);
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate data types
    const parsedAmount = parseFloat(amount);
    const parsedDuration = parseInt(duration);
    const parsedInterestRate = parseFloat(interestRate);
    const parsedMonthlyPayment = parseFloat(monthlyPayment);
    const parsedTotalRepayable = parseFloat(totalRepayable);

    if (
      isNaN(parsedAmount) ||
      isNaN(parsedDuration) ||
      isNaN(parsedInterestRate) ||
      isNaN(parsedMonthlyPayment) ||
      isNaN(parsedTotalRepayable)
    ) {
      console.error('Invalid data types:', {
        amount,
        duration,
        interestRate,
        monthlyPayment,
        totalRepayable
      });
      return res.status(400).json({
        message: 'Invalid data types: amount, duration, interestRate, monthlyPayment, and totalRepayable must be numbers'
      });
    }

    // Validate loanType
    const validLoanTypes = ['personal', 'business', 'student', 'mortgage', 'car loan', 'quickie loan'];
    if (!validLoanTypes.includes(loanType)) {
      console.error('Invalid loanType:', loanType);
      return res.status(400).json({
        message: `Invalid loanType. Must be one of: ${validLoanTypes.join(', ')}`
      });
    }

    // Check for recent defaulted loans
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentDefaultedLoan = await Loan.findOne({
      user: req.user._id,
      status: 'defaulted',
      defaultedAt: { $gte: threeMonthsAgo }
    });

    if (recentDefaultedLoan) {
      console.log('User has recent defaulted loan:', req.user._id);
      return res.status(403).json({
        message: 'You cannot apply for a new loan within 3 months of defaulting.'
      });
    }

    // Get document path
    const documentPath = req.file?.path;
    console.log('Document path:', documentPath || 'None');

    // Generate a unique Loan ID
    const loanId = `LOAN-${Date.now()}`;
    console.log('Generated loanId:', loanId);

    // Create new loan application
    const loanData = {
      user: req.user._id,
      loanId,
      amount: parsedAmount,
      duration: parsedDuration,
      reason,
      loanType,
      interestRate: parsedInterestRate,
      termMonths: parsedDuration,
      monthlyPayment: parsedMonthlyPayment,
      totalRepayable: parsedTotalRepayable,
      status: 'pending',
      applicationDate: new Date(),
      bankName,
      accountName,
      accountNumber,
      BVN,
      phone,
      email,
      documents: documentPath ? [documentPath] : []
    };

    console.log('Creating loan with data:', loanData);
    const newLoan = await Loan.create(loanData);
    console.log('Loan created successfully:', newLoan._id);

    res.status(201).json({
      message: 'Loan application submitted successfully',
      loan: newLoan
    });
  } catch (error) {
    console.error('Error in applyForLoan:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE' || error.message.includes('Unexpected field')) {
      return res.status(400).json({
        message: `File upload error: Unexpected field '${error.field || 'unknown'}'`
      });
    }
    if (error.message.includes('Only .jpeg, .jpg, .png, and .pdf formats are allowed')) {
      return res.status(400).json({
        message: error.message
      });
    }
    res.status(500).json({
      message: 'Server error. Please try again later.',
      error: error.message
    });
  }
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
  applyForLoan,
  rejectLoan,
  getLoanOffer,
  deleteLoanOffer,
  getUserLoans,
  getLoansByUser,
  getLoanOfferById
};
