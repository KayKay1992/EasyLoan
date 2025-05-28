import { useState, useEffect, useContext } from 'react';
import { BellIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosInstance';
import DashboardLayout from '../../Components/layouts/DashboardLayout';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all notifications
        const allResponse = await axiosInstance.get('/api/notification', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Fetch unread notifications
        const unreadResponse = await axiosInstance.get('/api/notification/unread', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        setNotifications(allResponse.data.notifications);
        setUnreadNotifications(unreadResponse.data.notifications);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/api/notification/read/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Update both all and unread notifications
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, read: true } : n
      ));
      setUnreadNotifications(unreadNotifications.filter(n => n._id !== id));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axiosInstance.delete(`/api/notification/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setNotifications(notifications.filter(n => n._id !== id));
      setUnreadNotifications(unreadNotifications.filter(n => n._id !== id));
      // Close modal if the deleted notification is the one being viewed
      if (selectedNotification && selectedNotification._id === id) {
        setShowModal(false);
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put('/api/notification/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Mark all as read in the UI
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadNotifications([]);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getNotificationById = async (id) => {
    try {
      const response = await axiosInstance.get(`/api/notification/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data.notification;
    } catch (err) {
      console.error('Error fetching notification:', err);
      return null;
    }
  };

  const handleNotificationClick = async (id) => {
    try {
      const notification = await getNotificationById(id);
      if (notification) {
        setSelectedNotification(notification);
        setShowModal(true);
        
        // Mark as read if unread
        if (!notification.read) {
          await markAsRead(id);
        }
      }
    } catch (err) {
      console.error('Error handling notification click:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
    }
  };

  const displayedNotifications = activeTab === 'all' ? notifications : unreadNotifications;

  if (loading) {
    return (
      <DashboardLayout activeMenu='Notifications' className="flex justify-center items-center h-screen bg-amber-600">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout activeMenu='Notifications' className="flex justify-center items-center h-screen bg-amber-600">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu='Notifications' className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-amber-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <BellIcon className="h-8 w-8 text-white mr-3" />
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              {unreadNotifications.length > 0 && (
                <span className="ml-3 bg-white text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {unreadNotifications.length} new
                </span>
              )}
            </div>
            {unreadNotifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm font-medium text-white hover:text-amber-100 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Notifications
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'unread'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Unread
                {unreadNotifications.length > 0 && (
                  <span className="ml-1 bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Notification List */}
          <div className="divide-y divide-gray-200">
            {displayedNotifications.length === 0 ? (
              <div className="text-center py-12">
                <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  {activeTab === 'all' ? 'No notifications' : 'No unread notifications'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'all' 
                    ? "You don't have any notifications yet." 
                    : "You've read all your notifications."}
                </p>
              </div>
            ) : (
              displayedNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 ${!notification.read ? 'bg-amber-50' : 'bg-white'} cursor-pointer`}
                  onClick={() => handleNotificationClick(notification._id)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          notification.read ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </p>
                        <div className="flex space-x-2">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification._id);
                              }}
                              className="text-xs text-amber-600 hover:text-amber-800 transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification._id);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span>
                          {new Date(notification.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Notification Detail Modal */}
      {showModal && selectedNotification && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  {getNotificationIcon(selectedNotification.type)}
                  <h3 className="ml-2 text-lg font-medium text-gray-900">
                    {selectedNotification.title}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {selectedNotification.message}
                </p>
                
                <div className="mt-4 text-xs text-gray-500">
                  <p>
                    Received: {new Date(selectedNotification.createdAt).toLocaleString()}
                  </p>
                  {selectedNotification.read && (
                    <p className="mt-1">
                      Read: {new Date(selectedNotification.updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    deleteNotification(selectedNotification._id);
                    setShowModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-amber-700 hover:text-amber-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default NotificationPage;