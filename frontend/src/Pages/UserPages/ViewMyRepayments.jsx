import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import DashboardLayout from '../../Components/layouts/DashboardLayout';

const ViewMyRepayments = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [repayments, setRepayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!userId) {
      setError('User ID is missing');
      setLoading(false);
      return;
    }

    const fetchRepayments = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          API_PATHS.REPAYMENT.GET_REPAYMENT_BY_USER(userId)
        );
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch repayments');
        }
        
        setRepayments(response.data.repayments);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch repayments');
        if (err.response?.status === 401 || err.response?.status === 400) {
          // navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRepayments();
  }, [userId, navigate]);

  const filteredRepayments = repayments.filter(rep => {
    if (activeTab === 'all') return true;
    return rep.loan.status === activeTab;
  });

  const totalPaid = repayments.reduce((sum, rep) => sum + rep.lastPayment, 0);
  const activeLoans = [...new Set(repayments.map(rep => rep.loan._id))].length;

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <DashboardLayout className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-600"></div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
        <p className="font-bold text-sm sm:text-base">Error</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={handleGoBack}
          className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 text-sm flex items-center justify-center w-full sm:w-auto"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 sm:h-5 sm:w-5 mr-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
              clipRule="evenodd" 
            />
          </svg>
          Go Back
        </button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900">Repayment Dashboard</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Track all your loan repayments</p>
          </div>
          <button
            onClick={handleGoBack}
            className="mt-4 sm:mt-0 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 text-sm flex items-center justify-center w-full sm:w-auto"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 sm:h-5 sm:w-5 mr-2" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                clipRule="evenodd" 
              />
            </svg>
            Back
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-gray-500">Total Repaid</h3>
                <p className="text-lg font-semibold text-gray-900">#{totalPaid.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-gray-500">Active Loans</h3>
                <p className="text-lg font-semibold text-gray-900">{activeLoans}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-gray-500">Total Repayments</h3>
                <p className="text-lg font-semibold text-gray-900">{repayments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 border-b border-gray-200">
          <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`${
                activeTab === 'all' ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 px-2 border-b-2 font-medium text-xs sm:text-sm`}
            >
              All Repayments
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`${
                activeTab === 'active' ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 px-2 border-b-2 font-medium text-xs sm:text-sm`}
            >
              Active Loans
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`${
                activeTab === 'completed' ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 px-2 border-b-2 font-medium text-xs sm:text-sm`}
            >
              Completed Loans
            </button>
          </nav>
        </div>

        {/* Repayments Table (Mobile: Card View, Desktop: Table) */}
        <div className="bg-white shadow rounded-lg">
          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-4 p-4">
            {filteredRepayments.length > 0 ? (
              filteredRepayments.map((repayment) => (
                <div key={repayment._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{repayment.loan.type}</div>
                        <div className="text-xs text-gray-500">ID: {repayment.loan._id.substring(0, 8)}...</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                      ${repayment.loan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                      {repayment.loan.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-900">Date: {new Date(repayment.paymentDate).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-500">Method: {repayment.paymentMethod}</div>
                  {repayment.referenceId && (
                    <div className="text-xs text-gray-400">Ref: {repayment.referenceId}</div>
                  )}
                  <div className="mt-2">
                    <div className="text-sm text-gray-900">Paid: <span className="font-semibold">#{repayment.lastPayment.toLocaleString()}</span></div>
                    <div className="text-sm text-gray-500">Total Paid: #{repayment.totalPaidSoFar.toLocaleString()}</div>
                    {repayment.loan.status === 'active' && (
                      <div className="text-xs text-gray-400">Balance: #{repayment.repaymentBalance.toLocaleString()}</div>
                    )}
                  </div>
                  {repayment.evidence && (
                    <button className="mt-2 text-amber-600 hover:text-amber-900 text-sm">
                      Receipt
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-gray-500 p-4">
                No repayments found for the selected filter
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan Details
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Info
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amounts
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRepayments.length > 0 ? (
                  filteredRepayments.map((repayment) => (
                    <tr key={repayment._id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{repayment.loan.type}</div>
                            <div className="text-xs text-gray-500">ID: {repayment.loan._id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(repayment.paymentDate).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{repayment.paymentMethod}</div>
                        {repayment.referenceId && (
                          <div className="text-xs text-gray-400">Ref: {repayment.referenceId}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="font-semibold">#{repayment.lastPayment.toLocaleString()}</span> paid
                        </div>
                        <div className="text-sm text-gray-500">
                          Total: #{repayment.totalPaidSoFar.toLocaleString()}
                        </div>
                        {repayment.loan.status === 'active' && (
                          <div className="text-xs text-gray-400">
                            Balance: #{repayment.repaymentBalance.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                          ${repayment.loan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                          {repayment.loan.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        {repayment.evidence && (
                          <button className="text-amber-600 hover:text-amber-900">
                            Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-3 text-center text-sm text-gray-500">
                      No repayments found for the selected filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mt-6 grid grid-cols-1 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-base font-medium text-gray-900 mb-3">Repayment Summary</h3>
            <div className="space-y-3">
              {[...new Set(repayments.map(r => r.loan._id))].map(loanId => {
                const loanRepayments = repayments.filter(r => r.loan._id === loanId);
                const loan = loanRepayments[0].loan;
                const totalPaid = loanRepayments.reduce((sum, r) => sum + r.lastPayment, 0);
                
                return (
                  <div key={loanId} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{loan.type}</h4>
                        <p className="text-xs text-gray-500">ID: {loanId.substring(0, 8)}...</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full 
                        ${loan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                        {loan.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Original:</span>
                        <span className="font-medium">#{loan.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Paid:</span>
                        <span className="font-medium text-green-600">#{totalPaid.toLocaleString()}</span>
                      </div>
                      {loan.status === 'active' && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Balance:</span>
                          <span className="font-medium text-amber-600">#{loanRepayments[0].repaymentBalance.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-base font-medium text-gray-900 mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {repayments.slice(0, 3).map(repayment => (
                <div key={repayment._id} className="flex items-start border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        Payment of #{repayment.lastPayment.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(repayment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {repayment.loan.type} loan via {repayment.paymentMethod}
                    </p>
                    <div className="mt-1 text-xs">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
                        ${repayment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {repayment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewMyRepayments;