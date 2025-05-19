// Import necessary React hooks and UI components
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../Components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { FiSearch, FiUser } from 'react-icons/fi';
import { Table, Input, Spin, message, Tag, Button, Modal } from 'antd';

// Main component to manage users and view their loan statistics
const ManageUsers = () => {
  // State variables to manage users and UI
  const [users, setUsers] = useState([]); // All fetched users
  const [filteredUsers, setFilteredUsers] = useState([]); // Users after applying search filter
  const [loading, setLoading] = useState(true); // Loading state for user fetch
  const [searchTerm, setSearchTerm] = useState(''); // Current search input
  const [loanModalVisible, setLoanModalVisible] = useState(false); // Controls modal visibility
  const [selectedUser, setSelectedUser] = useState(null); // Currently selected user for loan stats
  const [loanStats, setLoanStats] = useState(null); // Loan statistics object for selected user
  const [loanStatsLoading, setLoanStatsLoading] = useState(false); // Loading state for loan stats
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Responsive design flag

  // Effect to track window size for responsive UI
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch all users from the backend
  const fetchAllUsers = async () => {
    try {
      setLoading(true); // Show loading spinner
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      setUsers(response.data || []); // Populate users state
      setFilteredUsers(response.data || []); // Initialize filtered users
    } catch (error) {
      message.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  // Fetch loan statistics for a specific user
  const fetchLoanStats = async (userId) => {
    try {
      setLoanStatsLoading(true);
      const url = API_PATHS.LOANS.GET_USER_LOANS(userId); // Build request URL
      const response = await axiosInstance.get(url); // Fetch user loan data

      // Extract loans from response
      const loans = response.data.data || [];

      // Generate summary statistics based on loan status
      const stats = {
        total: loans.length,
        active: loans.filter(loan => loan.status === 'active').length,
        pending: loans.filter(loan => loan.status === 'pending').length,
        rejected: loans.filter(loan => loan.status === 'rejected').length,
        completed: loans.filter(loan => loan.status === 'completed').length,
        defaulted: loans.filter(loan => loan.status === 'defaulted').length,
      };

      setLoanStats(stats); // Set statistics in state
    } catch (error) {
      console.error('Error fetching loan stats:', error);

      // Gracefully handle errors based on status codes
      if (error.response?.status === 400) {
        message.error('Invalid user ID format');
      } else if (error.response?.status === 404) {
        if (error.response.data?.message?.includes('User not found')) {
          message.error('User not found');
        } else {
          message.warning('No loans found for this user');
          setLoanStats({
            total: 0, active: 0, pending: 0,
            rejected: 0, completed: 0, defaulted: 0,
          });
        }
      } else {
        message.error(`Failed to fetch loan statistics: ${error.message}`);
      }
    } finally {
      setLoanStatsLoading(false); // End loading
    }
  };

  // Apply search filtering to users list
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users); // Reset filter
    } else {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered); // Update filtered list
    }
  }, [searchTerm, users]);

  // Fetch users when the component mounts
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Trigger loan modal and fetch stats
  const handleViewLoans = (user) => {
    setSelectedUser(user);
    setLoanModalVisible(true);
    fetchLoanStats(user._id);
  };

  // Define the columns used in the Ant Design Table
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <div className="flex items-center">
          <FiUser className="mr-2 text-gray-500" />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    // Show additional fields only on desktop
    ...(!isMobile ? [
      {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
        render: (role) => (
          <Tag color={role === 'admin' ? 'purple' : 'orange'}>
            {role.toUpperCase()}
          </Tag>
        ),
      },
      {
        title: 'Joined Date',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (date) => new Date(date).toLocaleDateString(),
      },
    ] : []),
    {
      title: 'Actions',
      key: 'actions',
      render: (_, user) => (
        <Button type="link" onClick={() => handleViewLoans(user)}>
          <span className="btn-primary">View Details</span>
        </Button>
      ),
    },
  ];

  // JSX rendering the entire user management interface
  return (
    <DashboardLayout activeMenu="Users">
      <div className="p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">User Management</h1>

        {/* Search bar for filtering users */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Input
              placeholder="Search users by name or email..."
              prefix={<FiSearch className="text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              className="pl-10"
            />
          </div>
        </div>

        {/* Users table or loading spinner */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredUsers}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
            />
          )}
        </div>

        {/* Loan statistics modal */}
        <Modal
          title={`Loan Statistics for ${selectedUser?.name || 'User'}`}
          open={loanModalVisible}
          onCancel={() => setLoanModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setLoanModalVisible(false)}>
              Close
            </Button>,
          ]}
        >
          {loanStatsLoading ? (
            <div className="flex justify-center items-center h-32">
              <Spin />
            </div>
          ) : loanStats ? (
            <div className="space-y-4">
              <div><strong>Total Loans:</strong> {loanStats.total}</div>
              <div><strong>Active Loans:</strong> {loanStats.active}</div>
              <div><strong>Pending Approval:</strong> {loanStats.pending}</div>
              <div><strong>Rejected Loans:</strong> {loanStats.rejected}</div>
              <div><strong>Completed Loans:</strong> {loanStats.completed}</div>
              <div><strong>Defaulted Loans:</strong> {loanStats.defaulted}</div>
            </div>
          ) : (
            <p>No loan data available.</p>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ManageUsers;
