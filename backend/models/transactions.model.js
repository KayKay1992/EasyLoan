const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  type: {
    type: String,
    enum: ['payment', 'disbursement', 'refund'],
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },

  method: {
    type: String,
    enum: ['bank', 'card', 'mobile_money', 'cash'],
    required: true
  },

  transactionDate: {
    type: Date,
    default: Date.now
  },

  referenceId: {
    type: String,
    unique: true,
    required: true
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
