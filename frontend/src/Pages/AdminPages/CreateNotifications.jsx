import React, { useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../../Components/layouts/DashboardLayout";

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

  const handleSubmit = () => {
    console.log("Sending notification:", notification);
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
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="urgent">Urgent</option>
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
