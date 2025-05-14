// controllers/notificationController.js
const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
const getAllNotifications = asyncHandler(async (req, res) => {
  // Logic to fetch all notifications for the logged-in user
  const userId = req.user._id;

  // Fetch all notifications for the logged-in user
  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 });

  res.status(200).json({
    message: "All notifications fetched successfully",
    total: notifications.length,
    notifications,
  });
});

// @desc    Get unread notifications
// @route   GET /api/notifications/unread
// @access  Private
const getUnreadNotifications = asyncHandler(async (req, res) => {
  // Logic to fetch unread notifications
  const userId = req.user._id;

  // Fetch unread notifications for the logged-in user
  const unreadNotifications = await Notification.find({
    user: userId,
    isRead: false,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    message: "Unread notifications fetched successfully",
    total: unreadNotifications.length,
    notifications: unreadNotifications,
  });
});

// @desc    Get a single notification by ID
// @route   GET /api/notifications/:id
// @access  Private
const getNotificationById = asyncHandler(async (req, res) => {
    const notificationId = req.params.id;

  // Fetch the notification by ID
  const notification = await Notification.findById(notificationId)
    .populate('user', 'name email') // Populate user info
    .populate('referenceId'); // Automatically resolves using refPath

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  res.status(200).json({
    message: "Notification fetched successfully",
    notification,
  });
  });

// @desc    Create a notification for a user
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
  

// @desc    Create notifications for all users
// @route   POST /api/notifications/all
// @access  Admin
const createNotificationForAllUsers = asyncHandler(async (req, res) => {
    const { type, message, referenceId, referenceModel } = req.body;
  
    // Validate required fields (userId is no longer required)
    if (!type || !message) {
      res.status(400);
      throw new Error("Fields type and message are required");
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
  
    // Get all users
    const users = await User.find({}, '_id');
    if (!users || users.length === 0) {
      res.status(404);
      throw new Error("No users found");
    }

    // Prepare notifications for bulk insert
    const notifications = users.map(user => ({
      user: user._id,
      type,
      message,
      referenceId: referenceId || null,
      referenceModel: referenceId ? referenceModel : undefined,
      isRead: false,
      createdAt: new Date(),
    }));
  
    // Bulk insert notifications
    const createdNotifications = await Notification.insertMany(notifications);
  
    res.status(201).json({
      message: `Notifications created successfully for ${users.length} users`,
      count: createdNotifications.length,
    });
});

  

// @desc    Mark a notification as read
// @route   PUT /api/notifications/read/:id
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  // Logic to mark a notification as read
  const notificationId = req.params.id;
  const userId = req.user._id;

  // Find the notification by ID
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  // Ensure the notification belongs to the logged-in user
  if (notification.user.toString() !== userId.toString()) {
    res.status(403);
    throw new Error("You are not authorized to update this notification");
  }

  // Mark the notification as read
  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    message: "Notification marked as read",
    notification,
  });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  // Logic to delete a notification
  const notificationId = req.params.id;
  const userId = req.user._id;

  // Find the notification
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  // Ensure user owns the notification or is an admin
  if (notification.user.toString() !== userId.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error("You are not authorized to delete this notification");
  }

  // Delete the notification
  await notification.deleteOne();

  res.status(200).json({
    message: "Notification deleted successfully",
    notificationId,
  });
});

module.exports = {
  getAllNotifications,
  getUnreadNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  deleteNotification,
  createNotificationForAllUsers,
};
