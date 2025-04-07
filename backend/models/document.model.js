const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  type: {
    type: String,
    enum: ['ID Proof', 'Income Proof', 'Bank Statement', 'Address Proof', 'Other'],
    required: true
  },

  fileUrl: {
    type: String,
    required: true
  },

  fileName: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', documentSchema);
