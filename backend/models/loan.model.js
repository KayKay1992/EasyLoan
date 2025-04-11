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
  loanType: {
    type: String,
    enum: ['personal', 'business', 'student', 'mortgage', 'car loan','quickie loan'], // You can add more
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
    enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'defaulted'],
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
