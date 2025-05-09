const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllLoans,
  getLoanById,
  createLoan,
  updateLoan,
  deleteLoan,
  updateLoanStatus,
  getAdminLoanDashboard,
  getUserLoanDashboard,
  applyForLoan,
  rejectLoan
} = require('../controllers/loan.controller');

const { uploadDocument } = require('../middleware/fileUploadMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Loan dashboard routes
router.get('/dashboard-data', protect, adminOnly, getAdminLoanDashboard); // Admin dashboard
router.get('/user-dashboard-data', protect, getUserLoanDashboard); // User-specific loan stats

// Loan management
router.get('/', protect, adminOnly, getAllLoans); // Get all loans
router.get('/:id', protect, getLoanById); // Get loan by ID
router.post('/', protect, adminOnly, upload.single("document"), createLoan); // Create new loan (admin only)
router.put('/:id', protect, updateLoan); // Update loan (admin or owner)
router.delete('/:id', protect, adminOnly, deleteLoan); // Delete loan (admin only)
router.post('/reject/:id', protect, adminOnly, rejectLoan);
router.put('/:id/status', protect, updateLoanStatus); // Update loan status (e.g., approved, completed)
router.post('/apply', protect, uploadDocument.single('document'), applyForLoan);


module.exports = router;
