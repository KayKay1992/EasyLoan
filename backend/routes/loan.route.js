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
  applyForLoan
} = require('../controllers/loan.controller');

const { uploadDocument } = require('../middleware/fileUploadMiddleware');

const router = express.Router();

// Loan dashboard routes
router.get('/dashboard-data', protect, adminOnly, getAdminLoanDashboard); // Admin dashboard
router.get('/user-dashboard-data', protect, getUserLoanDashboard); // User-specific loan stats

// Loan management
router.get('/', protect, adminOnly, getAllLoans); // Get all loans
router.get('/:id', protect, getLoanById); // Get loan by ID
router.post('/', protect, adminOnly, createLoan); // Create new loan (admin only)
router.put('/:id', protect, updateLoan); // Update loan (admin or owner)
router.delete('/:id', protect, adminOnly, deleteLoan); // Delete loan (admin only)
router.put('/:id/status', protect, updateLoanStatus); // Update loan status (e.g., approved, completed)
router.post('/apply', protect, uploadDocument.single('document'), applyForLoan);


module.exports = router;
