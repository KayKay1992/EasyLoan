// models/Notification.js

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Type of notification for filtering and UI
  type: {
    type: String,
    enum: ['loan', 'repayment', 'warning', 'offer', 'system'],
    required: true,
  },

  // The actual message shown to the user
  message: {
    type: String,
    required: true,
  },

  // Optional: related loan or repayment ID
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel',
  },

  // Dynamic reference to either Loan or Repayment model
  referenceModel: {
    type: String,
    enum: ['Loan', 'Repayment'],
  },

  // Whether the user has read this notification
  isRead: {
    type: Boolean,
    default: false,
  },

  // Timestamp
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Notification', notificationSchema);

