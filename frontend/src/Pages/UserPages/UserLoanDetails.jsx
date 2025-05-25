import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import DashboardLayout from '../../Components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { format } from 'date-fns';

const UserLoanDetails = () => {
  const { id } = useParams(); // Get loan ID from URL parameters
  const navigate = useNavigate(); // Hook for navigation
  const [loan, setLoan] = useState(null); // State for storing loan data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch loan details when component mounts or ID changes
  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        if (!id) {
          throw new Error('Loan ID is missing');
        }
        
        const response = await axiosInstance.get(API_PATHS.LOANS.GET_LOAN_BY_ID(id));
        setLoan(response.data); // Store loan data in state
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch loan details');
      } finally {
        setLoading(false); // Set loading to false regardless of success/failure
      }
    };

    fetchLoanDetails();
  }, [id]);

  // Function to calculate end date based on start date and term months
  const calculateEndDate = () => {
    if (!loan?.createdAt || !loan?.termMonths) return null;
    
    const startDate = new Date(loan.createdAt);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + loan.termMonths);
    return endDate;
  };

  // Function to return color classes based on loan status
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to format currency in Nigerian Naira
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  // Loading state UI
  if (loading) {
    return (
      <DashboardLayout activeMenu="My Loans">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state UI
  if (error) {
    return (
      <DashboardLayout activeMenu="My Loans">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  // No loan found UI
  if (!loan) {
    return (
      <DashboardLayout activeMenu="My Loans">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p>Loan not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const endDate = calculateEndDate(); // Calculate loan end date

  // Main component render
  return (
    <DashboardLayout activeMenu="My Loans">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Loan Details</h1>
          <button
            onClick={() => navigate(-1)} // Go back to previous page
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            ← Back to Loans
          </button>
        </div>
        
        {/* Loan details section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic information column */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <p className="text-sm font-medium text-gray-500">Loan ID</p>
                  <p className="mt-1">{loan._id}</p>
                </div>
                
                <div className="border-b pb-4">
                  <p className="text-sm font-medium text-gray-500">User</p>
                  <p className="mt-1">{loan.user.name} ({loan.user.email})</p>
                </div>
                
                <div className="border-b pb-4">
                  <p className="text-sm font-medium text-gray-500">Loan Type</p>
                  <p className="mt-1 capitalize">{loan.loanType}</p>
                </div>
                
                <div className="border-b pb-4">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                    {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                  </span>
                </div>
                
                <div className="border-b pb-4">
                  <p className="text-sm font-medium text-gray-500">Date Created</p>
                  <p className="mt-1">{format(new Date(loan.createdAt), 'MMMM d, yyyy h:mm a')}</p>
                </div>

                {/* Added End Date Display */}
                {endDate && (
                  <div className="border-b pb-4">
                    <p className="text-sm font-medium text-gray-500">Projected End Date</p>
                    <p className="mt-1">{format(endDate, 'MMMM d, yyyy')}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Financial details column */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Financial Details</h2>
              
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <p className="text-sm font-medium text-gray-500">Loan Amount</p>
                  <p className="mt-1">{formatCurrency(loan.amount)}</p>
                </div>
                
                <div className="border-b pb-4">
                  <p className="text-sm font-medium text-gray-500">Interest Rate</p>
                  <p className="mt-1">{loan.interestRate}%</p>
                </div>
                
                <div className="border-b pb-4">
                  <p className="text-sm font-medium text-gray-500">Term</p>
                  <p className="mt-1">{loan.termMonths} months</p>
                </div>
                
                <div className="border-b pb-4">
                  <p className="text-sm font-medium text-gray-500">Monthly Payment</p>
                  <p className="mt-1">{formatCurrency(loan.monthlyPayment)}</p>
                </div>
                
                <div className="border-b pb-4">
                  <p className="text-sm font-medium text-gray-500">Total Repayable</p>
                  <p className="mt-1">{formatCurrency(loan.totalRepayable)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
     {/* Documents section with additional safeguards */}
 {loan.documents && loan.documents.length > 0 ? (
              <section className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 border-b-2 border-amber-200 pb-2 mb-4">
                  Documents
                </h3>
                <ul className="space-y-2">
                  {loan.documents.map((doc, index) => (
                    <li key={index}>
                      <a
                        href={`${axiosInstance.defaults.baseURL}/${doc}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-500 hover:text-amber-600 font-medium"
                      >
                        Document {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <section className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 border-b-2 border-amber-200 pb-2 mb-4">
                  Documents
                </h3>
                <p className="text-gray-600">No documents available.</p>
              </section>
            )}
      </div>
    </DashboardLayout>
  );
};

export default UserLoanDetails;