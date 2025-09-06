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

const router = express.Router();

// Public route: Get all loan offers
router.get('/offer', getLoanOffer);

// Loan dashboard routes
router.get('/dashboard-data', protect, adminOnly, getAdminLoanDashboard);
router.get('/user-dashboard-data', protect, getUserLoanDashboard);

// Loan management
router.get('/', protect, adminOnly, getAllLoans); 
router.post('/', protect, adminOnly, uploadDocument.single('document'), createLoan);
router.put('/:id/status', protect, updateLoanStatus);
router.post('/reject/:id', protect, adminOnly, rejectLoan);
router.put('/:id', protect, adminOnly, uploadDocument.single('document'), updateLoan);
router.post('/apply', protect, uploadDocument.single('document'), applyForLoan);
router.delete('/:id', protect, adminOnly, deleteLoanOffer);

// Specific routes before generic
router.get('/offer/:id', protect, getLoanOfferById);
router.get('/user/:userId/stats', protect, getUserLoans);
router.get('/user/:userId', protect, getLoansByUser);

// Keep generic route last
router.get('/:id', protect, getLoanById);

module.exports = router;
