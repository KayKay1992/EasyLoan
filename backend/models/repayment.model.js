const mongoose = require('mongoose');

const repaymentSchema = new mongoose.Schema({
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  amountPaid: {
    type: Number,
    required: true
  },

  paymentDate: {
    type: Date,
    default: Date.now
  },

  dueDate: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ['paid', 'late', 'upcoming'],
    default: 'paid'
  },

  paymentMethod: {
    type: String,
    enum: ['bank', 'card', 'mobile_money', 'cash'],
    default: 'bank'
  },

  referenceId: {
    type: String,
    unique: true,
    required: true
  }
});

module.exports = mongoose.model('Repayment', repaymentSchema);
