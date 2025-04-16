// controllers/notificationController.js
const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
const getAllNotifications = asyncHandler(async (req, res) => {
  // Logic to fetch all notifications for the logged-in user
});

// @desc    Get unread notifications
// @route   GET /api/notifications/unread
// @access  Private
const getUnreadNotifications = asyncHandler(async (req, res) => {
  // Logic to fetch unread notifications
});

// @desc    Get a single notification by ID
// @route   GET /api/notifications/:id
// @access  Private
const getNotificationById = asyncHandler(async (req, res) => {
  // Logic to get a specific notification by ID
});

// @desc    Create a notification
// @route   POST /api/notifications
// @access  Admin
const createNotification = asyncHandler(async (req, res) => {
    const { type, message, userId, referenceId, referenceModel } = req.body;
  
    // Validate required fields
    if (!type || !message || !userId) {
      res.status(400);
      throw new Error("Fields type, message, and userId are required");
    }
  
    // Allowed types from schema
    const allowedTypes = ['loan', 'repayment', 'warning', 'offer', 'system'];
    if (!allowedTypes.includes(type)) {
      res.status(400);
      throw new Error(`Invalid type. Allowed: ${allowedTypes.join(', ')}`);
    }
  
    // Validate referenceModel if referenceId is provided
    if (referenceId && !['Loan', 'Repayment'].includes(referenceModel)) {
      res.status(400);
      throw new Error("referenceModel must be 'Loan' or 'Repayment' if referenceId is provided");
    }
  
    // Ensure user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    
  
    // Create notification
    const notification = await Notification.create({
      user: userId,
      type,
      message,
      referenceId: referenceId || null,
      referenceModel: referenceId ? referenceModel : undefined,
      isRead: false,
      createdAt: new Date(),
    });
  
    res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  });
  
  

// @desc    Mark a notification as read
// @route   PUT /api/notifications/read/:id
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  // Logic to mark a notification as read
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  // Logic to delete a notification
});

module.exports = {
  getAllNotifications,
  getUnreadNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  deleteNotification,
};
