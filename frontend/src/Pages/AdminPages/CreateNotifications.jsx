import React, { useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../../Components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { motion } from "framer-motion";

const Notification = () => {
  // State for notification form data
  const [notification, setNotification] = useState({
    type: "",        // Type of notification (loan, repayment, etc)
    title: "",       // Notification title
    message: "",     // Notification content
    userId: "",      // Target user ID (empty for all users)
  });

  // State to track bulk send operation status
  const [isSendingToAll, setIsSendingToAll] = useState(false);

  // Handler for form field changes
  const handleChange = (key, value) => {
    setNotification((prev) => ({ ...prev, [key]: value }));
  };

  // Function to create notification for a specific user
  const createNotification = async ({ type, title, message, userId }) => {
    // Validate required fields
    if (!type || !title || !message || !userId) {
      toast.error("All notification fields are required");
      return;
    }

    try {
      // API call to create single notification
      await axiosInstance.post(API_PATHS.NOTIFICATION.CREATE_NOTIFICATION, {
        type,
        title,
        message,
        userId,
      });
      toast.success("Notification created successfully!");
    } catch (error) {
      console.error("Notification creation failed:", error);
      toast.error("Failed to create notification");
    }
  };

  // Function to create notification for all users
  const createNotificationForAll = async ({ type, title, message }) => {
    // Validate required fields (userId not needed for bulk)
    if (!type || !title || !message) {
      toast.error("Type, title and message are required");
      return;
    }

    try {
      setIsSendingToAll(true); // Activate loading state
      // API call for bulk notification
      await axiosInstance.post(API_PATHS.NOTIFICATION.CREATE_NOTIFICATION_FOR_ALL, {
        type,
        title,
        message,
      });
      toast.success(`Notification sent to all users successfully!`);
    } catch (error) {
      console.error("Bulk notification failed:", error);
      toast.error("Failed to send notification to all users");
    } finally {
      setIsSendingToAll(false); // Reset loading state
    }
  };

  // Handler for single user notification submission
  const handleSubmit = () => {
    const { type, title, message, userId } = notification;

    // Validation checks
    if (!type || !title || !message || !userId) {
      toast.error("Please fill in all fields before sending the notification.");
      return;
    }
    if (title.length < 3) {
      toast.error("Title must be at least 3 characters.");
      return;
    }
    if (message.length < 5) {
      toast.error("Message must be at least 5 characters.");
      return;
    }

    createNotification(notification);
    setNotification({ type: "", title: "", message: "", userId: "" }); // Reset form
  };

  // Handler for bulk notification submission
  const handleSubmitAll = () => {
    const { type, title, message } = notification;

    // Validation checks (userId not required)
    if (!type || !title || !message) {
      toast.error("Type, title and message are required");
      return;
    }
    if (title.length < 3) {
      toast.error("Title must be at least 3 characters.");
      return;
    }
    if (message.length < 5) {
      toast.error("Message must be at least 5 characters.");
      return;
    }

    createNotificationForAll({ type, title, message });
  };

  return (
    <DashboardLayout activeMenu="Notifications">
      {/* Animated container with fade-in effect */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-10 border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Notification</h2>
        
        <div className="space-y-5">
          {/* Notification Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={notification.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-700 focus:outline-none"
            >
              <option value="">Select Type</option>
              <option value="loan">Loan</option>
              <option value="repayment">Repayment</option>
              <option value="warning">Warning</option>
              <option value="offer">Offer</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Notification Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={notification.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. Loan Approval"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-700 focus:outline-none"
            />
          </div>

          {/* Notification Message Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              rows={4}
              value={notification.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Write your message here..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 resize-none focus:ring-2 focus:ring-amber-700 focus:outline-none"
            />
          </div>

          {/* User ID Input (optional for bulk send) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID (Leave empty for all users)
            </label>
            <input
              type="text"
              value={notification.userId}
              onChange={(e) => handleChange("userId", e.target.value)}
              placeholder="Paste User ID here or leave blank for all users"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-700 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex justify-between">
            {/* Send to Specific User Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}  // Hover animation
              whileTap={{ scale: 0.98 }}    // Click animation
              onClick={handleSubmit}
              disabled={!notification.userId} // Disabled when no user ID
              className={`px-6 py-3 rounded-xl font-semibold transition cursor-pointer ${
                !notification.userId
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-900 text-white"
              }`}
            >
              Send to Specific User
            </motion.button>

            {/* Send to All Users Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmitAll}
              disabled={isSendingToAll}
              className={`px-6 py-3 rounded-xl font-semibold transition ${
                isSendingToAll
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-800 text-white"
              }`}
            >
              {isSendingToAll ? (
                // Loading state
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send to All Users"
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Notification;