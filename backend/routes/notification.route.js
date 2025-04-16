const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getAllNotifications, createNotification, deleteNotification, getNotificationById, markAsRead, getUnreadNotifications } = require('../controllers/notification.controller');


const router = express.Router();

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private (Authenticated User)
router.get('/', protect, getAllNotifications);



// @desc    Create a notification for a user
// @route   POST /api/notifications
// @access  Admin
router.post('/', protect, adminOnly, createNotification);


// @desc    Mark a notification as read
// @route   PUT /api/notifications/read/:id
// @access  Private (Authenticated User)
router.put('/read/:id', protect, markAsRead);

// @desc    Get unread notifications for a user
// @route   GET /api/notifications/unread
// @access  Private (Authenticated User)
router.get('/unread', protect, getUnreadNotifications);



// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private (Admin or User who owns the notification)
router.delete('/:id', protect, deleteNotification);

// @desc    Get a notification by ID
// @route   GET /api/notifications/:id
// @access  Private (Authenticated User)
router.get('/:id', protect, getNotificationById);

module.exports = router;
