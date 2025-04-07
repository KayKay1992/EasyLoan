const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  interestRate: {
    type: Number,
    required: true
  },

  termMonths: {
    type: Number,
    required: true
  },

  monthlyPayment: {
    type: Number,
    required: true
  },

  totalRepayable: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'completed'],
    default: 'pending'
  },

  startDate: {
    type: Date
  },

  endDate: {
    type: Date
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Loan', loanSchema);
