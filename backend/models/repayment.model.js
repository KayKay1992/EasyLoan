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
    enum: ['paid', 'late', 'upcoming', 'rejected'],
    default: 'paid'
  },

  paymentMethod: {
    type: String,
    enum: ['bank', 'card', 'mobile_money', 'cash', 'bank transfer'],
    default: 'bank'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },

  referenceId: {
    type: String,
    unique: true,
    required: true
  },
  evidence: {
    type: String,
  }
});

module.exports = mongoose.model('Repayment', repaymentSchema);
