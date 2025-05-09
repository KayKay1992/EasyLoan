import React, { useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../../Components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const Notification = () => {
  const [notification, setNotification] = useState({
    type: "",
    title: "",
    message: "",
    userId: "",
  });

  const handleChange = (key, value) => {
    setNotification((prev) => ({ ...prev, [key]: value }));
  };


  const createNotification = async ({ type, title, message, userId }) => {
    if (!type || !title || !message || !userId) {
      toast.error("All notification fields are required");
      return;
    }
  
    try {
      const payload = { type, title, message, userId };
  
      await axiosInstance.post(API_PATHS.NOTIFICATION.CREATE_NOTIFICATION,  {
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

  const handleSubmit = () => {
    const { type, title, message, userId } = notification;

    // Validation
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
    createNotification(notification)
    toast.success("Notification sent!");
    setNotification({ type: "", title: "", message: "", userId: "" });
  };

  return (
    <DashboardLayout activeMenu="Notifications">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-10 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Notification</h2>
        <div className="space-y-5">
          {/* Notification Type */}
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

          {/* Title */}
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

          {/* Message */}
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

          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="text"
              value={notification.userId}
              onChange={(e) => handleChange("userId", e.target.value)}
              placeholder="Paste User ID here"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-700 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSubmit}
              className="bg-amber-600 hover:bg-amber-900 text-white px-6 py-3 rounded-xl font-semibold transition cursor-pointer"
            >
              Send Notification
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notification;
