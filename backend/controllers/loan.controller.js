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

    // Find the loan by its ID and populate user name and email
    const loan = await Loan.findById(id).populate('user', 'name email');
  
    // If loan not found, return 404 error
    if (!loan) {
      res.status(404);
      throw new Error('Loan not found');
    }
  
    // Return the found loan
    res.status(200).json(loan);
});

// @desc    Admin creates loan template (not assigned to user)
// @route   POST /api/loan-templates
// @access  Admin
const createLoan = asyncHandler(async (req, res) => {
  const { amount, interestRate, termMonths, loanType } = req.body;

  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to create a loan template");
  }

  if (!amount || !interestRate || !termMonths || !loanType) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const parsedAmount = parseFloat(amount);
  const parsedInterestRate = parseFloat(interestRate);
  const parsedTermMonths = parseInt(termMonths);

  if (isNaN(parsedAmount) || isNaN(parsedInterestRate) || isNaN(parsedTermMonths)) {
    res.status(400);
    throw new Error("Invalid numeric input");
  }

  const loan = await Loan.create({
    loanType,
    amount: parsedAmount,
    interestRate: parsedInterestRate,
    termMonths: parsedTermMonths,
    createdBy: req.user._id,
  });

  res.status(201).json({
    message: "Loan created successfully",
    loan,
  });
});



// @desc    Update a loan
// @route   PUT /api/loans/:id
// @access  Protected (Admin or Owner)
const updateLoan = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find the loan by ID
    const loan = await Loan.findById(id);
  
    // If loan not found, return error
    if (!loan) {
      res.status(404);
      throw new Error('Loan not found');
    }
  
    // Optional: Only allow admin or the loan owner to update
    if (
      req.user.role !== 'admin' &&
      loan.user.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to update this loan');
    }
  
    // Update allowed fields
    const updatedFields = {
      amount: req.body.amount ?? loan.amount,
      interestRate: req.body.interestRate ?? loan.interestRate,
      termMonths: req.body.termMonths ?? loan.termMonths,
      loanType: req.body.loanType ?? loan.loanType,
      status: req.body.status ?? loan.status,
      startDate: req.body.startDate ?? loan.startDate,
      endDate: req.body.endDate ?? loan.endDate,
    };
  
    // Recalculate monthlyPayment and totalRepayable if related fields changed
    if (req.body.amount || req.body.interestRate || req.body.termMonths) {
      const monthlyInterestRate = updatedFields.interestRate / 100 / 12;
      const monthlyPayment = (
        updatedFields.amount *
        monthlyInterestRate /
        (1 - Math.pow(1 + monthlyInterestRate, -updatedFields.termMonths))
      ).toFixed(2);
  
      updatedFields.monthlyPayment = monthlyPayment;
      updatedFields.totalRepayable = (monthlyPayment * updatedFields.termMonths).toFixed(2);
    }
  
    // Apply updates and save
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
      throw new Error('Loan not found');
    }
  
    // Only admin can delete a loan
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this loan');
    }
  
    // Delete the loan
    await loan.deleteOne();
  
    // Send success response
    res.status(200).json({ message: `Loan deleted successfully: ${id}` });
});

// @desc    Update loan status
// @route   PUT /api/loans/:id/status
// @access  Protected
const updateLoanStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    // Valid statuses allowed in the loan schema
    const validStatuses = ['pending', 'approved', 'rejected', 'active', 'completed'];
  
    // Check if provided status is valid
    if (!validStatuses.includes(status)) {
      res.status(400);
      throw new Error('Invalid loan status');
    }
  
    // Find the loan by ID
    const loan = await Loan.findById(id);
  
    // If not found, return an error
    if (!loan) {
      res.status(404);
      throw new Error('Loan not found');
    }
  
    // Only admin can update loan status
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update loan status');
    }
  
    // Update the loan status
    loan.status = status;
  
    // Optionally, set start and end dates for 'active' or 'completed' statuses
    if (status === 'active') {
      loan.startDate = new Date();
    } else if (status === 'completed') {
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
      // 1. FETCH BASIC STATISTICS
      // Count all loans in the database
      const totalLoans = await Loan.countDocuments();
  
      // Count loans with "Pending" status
      const pendingLoans = await Loan.countDocuments({
        status: "pending",
      });
  
      // Count loans with "Approved" status
      const approvedLoans = await Loan.countDocuments({
        status: "approved",
      });
  
      // Count loans with "Active" status
      const activeLoans = await Loan.countDocuments({
        status: "active",
      });
  
      // Count loans with "Completed" status
      const completedLoans = await Loan.countDocuments({
        status: "completed",
      });
  
      // Count loans with "Defaulted" status
      const defaultedLoans = await Loan.countDocuments({
        status: "defaulted",
      });
  
      // 2. LOAN DISTRIBUTION BY STATUS
      // Define all possible status values we want to track
      const loanStatuses = ["pending", "approved", "active", "completed", "rejected", "defaulted"];
      
      // Aggregate loans by status (raw data from MongoDB)
      const loanDistributionRaw = await Loan.aggregate([
        {
          $group: {
            _id: "$status", // Group by status field
            count: { $sum: 1 }, // Count documents in each group
          },
        },
      ]);
  
      // Transform raw data into a consistent format including all statuses
      const loanDistribution = loanStatuses.reduce((acc, status) => {
        const formattedKey = status.replace(/\s+/g, ""); // Remove spaces for response keys
        acc[formattedKey] =
          loanDistributionRaw.find((item) => item._id === status)?.count || 0;
        return acc;
      }, {});
  
      loanDistribution["All"] = totalLoans; // Add total count
  
      // 3. LOAN TYPES DISTRIBUTION
      // Define expected loan types (personal, business, etc.)
      const loanTypes = ["personal", "business", "student", "mortgage", "car loan", "quickie loan"];
      
      // Aggregate loans by loan type
      const loanTypeLevelsRaw = await Loan.aggregate([
        {
          $group: {
            _id: "$loanType",
            count: { $sum: 1 }, // Count loans in each type
          },
        },
      ]);
  
      // Transform loan type data to include all types
      const loanTypeLevels = loanTypes.reduce((acc, type) => {
        acc[type] =
          loanTypeLevelsRaw.find((item) => item._id === type)?.count || 0;
        return acc;
      }, {});
  
      // 4. RECENT LOANS
      // Get 10 most recent loans with selected fields
      const recentLoans = await Loan.find()
        .sort({ createdAt: -1 }) // Newest first
        .limit(10)
        .select("amount loanType status createdAt user");
  
      // 5. RETURN COMPREHENSIVE DASHBOARD DATA
      res.status(200).json({
        statistics: {
          totalLoans,
          pendingLoans,
          approvedLoans,
          activeLoans,
          completedLoans,
          defaultedLoans, // Include defaulted loans in the statistics
        },
        charts: {
          loanDistribution, // By status
          loanTypeLevels, // By loan type
        },
        recentLoans, // Recent loan activity
      });
    } catch (error) {
      // 6. ERROR HANDLING
      console.error("Admin loan dashboard error:", error); // Log for debugging
      res.status(500).json({
        message: "Server Error", // Return server error message
        error: error.message, // Return error message for debugging
      });
    }
  });

  

// @desc    Get user-specific loan dashboard data
// @route   GET /api/loans/user-dashboard-data
// @access  Protected
const getUserLoanDashboard = asyncHandler(async (req, res) => {
     // Get the authenticated user's ID from the request
     const userId = req.user._id;

     // 1. FETCH BASIC STATISTICS FOR USER'S LOANS
     // Count all loans taken by the user
     const totalLoans = await Loan.countDocuments({ user: userId });
 
     // Count active loans for the user
     const activeLoans = await Loan.countDocuments({
       user: userId,
       status: 'active'
     });
 
     // Count completed loans for the user
     const completedLoans = await Loan.countDocuments({
       user: userId,
       status: 'completed'
     });
 
     // Count defaulted loans (not completed and overdue)
     const defaultedLoans = await Loan.countDocuments({
       user: userId,
       status: 'defaulted'
     });
 
     // 2. LOAN TYPES DISTRIBUTION
     // All possible loan types to track
     const loanTypes = ['personal', 'business', 'student', 'mortgage', 'car loan', 'quickie loan'];
 
     // Get raw count of loans grouped by type for the user
     const loanTypesRaw = await Loan.aggregate([
       { $match: { user: userId } }, // Filter loans by the user
       { $group: { 
         _id: '$loanType',  // Group by loan type
         count: { $sum: 1 }  // Count loans in each group
       }}
     ]);
 
     // Transform data to include all loan types (even with 0 count)
     const loanTypesDistribution = loanTypes.reduce((acc, type) => {
       acc[type] = loanTypesRaw.find((item) => item._id === type)?.count || 0;
       return acc;
     }, {});
 
     // 3. RECENT LOANS
     // Get 5 most recent loans for the user with selected fields
     const recentLoans = await Loan.find({ user: userId })
       .sort({ createdAt: -1 })  // Newest first
       .limit(5)                 // Only 5 most recent loans
       .select("amount loanType status createdAt"); // Selected fields
 
     // 4. RETURN COMPREHENSIVE LOAN DATA FOR THE USER
     res.status(200).json({
       statistics: {
         totalLoans,      // Total loans for the user
         activeLoans,     // Active loans count
         completedLoans,  // Completed loans count
         defaultedLoans   // Defaulted loans count
       },
       loanTypes: loanTypesDistribution,  // Loan distribution by type
       recentLoans  // List of recent loans
     });
 
 
});

const applyForLoan = asyncHandler(async (req, res) => {
  const { amount, duration, reason, loanType, interestRate, bankName,
    accountName,
    accountNumber,
    BVN, phone, email} = req.body;

  // STEP 1: Check if user has defaulted within the last 3 months
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const recentDefaultedLoan = await Loan.findOne({
    user: req.user._id,
    status: 'defaulted',
    defaultedAt: { $gte: threeMonthsAgo } // Must exist in your schema
  });

  if (recentDefaultedLoan) {
    return res.status(403).json({
      message: "You cannot apply for a new loan within 3 months of defaulting."
    });
  }

  const documentPath = req.file?.path; // for loan documents

   // Generate a unique Loan ID (example: LOAN-1687984353463)
  const loanId = `LOAN-${Date.now()}`

  // STEP 2: Calculate monthly payment and total repayable
  const monthlyInterestRate = interestRate / 100 / 12;
  const termMonths = duration;
  const monthlyPayment = (amount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -termMonths));
  const totalRepayable = monthlyPayment * termMonths;

  // STEP 3: Create new loan application
  const newLoan = await Loan.create({
    user: req.user._id,
    loanId, // Store the generated loan ID
    amount,
    duration,
    reason,
    loanType,
    interestRate,
    termMonths,
    monthlyPayment,
    totalRepayable,
    status: 'pending',
    applicationDate: new Date(),
    bankName,
    accountName,
    accountNumber,
    BVN,
    phone,
    email, // assuming your schema supports this
    documents:  documentPath // Add path to uploaded file, // Multer required
  });

  res.status(201).json({
    message: "Loan application submitted successfully",
    loan: newLoan,
  });
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
  applyForLoan
};
