const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  interestRate: {
    type: Number,
    required: true,
    default: 5.0 // % annual
  },

  loanTermOptions: {
    type: [Number], // in months (e.g., 6, 12, 24)
    default: [6, 12, 24, 36]
  },

  maxLoanAmount: {
    type: Number,
    default: 10000000
  },

  minLoanAmount: {
    type: Number,
    default: 10000
  },

  currency: {
    type: String,
    default: 'NGN'
  },

  gracePeriodDays: {
    type: Number,
    default: 7 // days before penalty
  },

  latePaymentPenalty: {
    type: Number,
    default: 2.5 // % of amount due
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
