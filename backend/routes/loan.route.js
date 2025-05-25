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
  rejectLoan,
  getLoanOffer,
  deleteLoanOffer,
  getUserLoans,
  getLoansByUser,
  getLoanOfferById
} = require('../controllers/loan.controller');
const { uploadDocument } = require('../middleware/fileUploadMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public route: Get all loan offers
router.get('/offer', getLoanOffer);

// Loan dashboard routes
router.get('/dashboard-data', protect, adminOnly, getAdminLoanDashboard);
router.get('/user-dashboard-data', protect, getUserLoanDashboard);

// Loan management
router.get('/', protect, adminOnly, getAllLoans); // All loans
router.post('/', protect, adminOnly, upload, createLoan); // Create loan
router.put('/:id/status', protect, updateLoanStatus); // Update status
router.post('/reject/:id', protect, adminOnly, rejectLoan); // Reject loan
router.put('/:id', protect, adminOnly, upload, updateLoan); // Update loan
router.post('/apply', protect, upload, applyForLoan); // Apply for loan
router.get('/user/:userId/stats', protect, getUserLoans); // User stats
router.delete('/:id', protect, adminOnly, deleteLoanOffer); // Delete loan
router.get('/:id', protect, getLoanById); // ⚠️ Must be last: generic route
router.get('/offer/:id', protect, getLoanOfferById); // ⚠️ Must be last: generic route
router.get('/user/:userId', protect, getLoansByUser); // ⚠️ Must be last: generic route

module.exports = router;
