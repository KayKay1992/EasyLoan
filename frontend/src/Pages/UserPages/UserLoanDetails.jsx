import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../Components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { format } from 'date-fns';

const UserLoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sanitizeDocumentUrl = (url) => {
    if (!url) return '';
    const baseUrl = import.meta.env.VITE_API_URL || 'https://easyloan.onrender.com';
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
    const patterns = [
      'http://localhost:3000',
      'https://localhost:3000',
      'https://easyloan-1.onrender.com',
    ];
    let sanitized = url;
    patterns.forEach((pattern) => {
      sanitized = sanitized.replace(new RegExp(pattern, 'g'), normalizedBaseUrl);
    });
    sanitized = sanitized.replace(/\/*[uU]ploads\//g, '/uploads/');
    if (!sanitized.startsWith(normalizedBaseUrl)) {
      sanitized = `${normalizedBaseUrl}/uploads/${sanitized.split('/uploads/').pop()}`;
    }

    return sanitized;
  };

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        if (!id) throw new Error('Loan ID is missing');
        const response = await axiosInstance.get(API_PATHS.LOANS.GET_LOAN_BY_ID(id));
        setLoan(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch loan details');
      } finally {
        setLoading(false);
      }
    };

    fetchLoanDetails();
  }, [id]);

  const calculateEndDate = () => {
    if (!loan?.createdAt || !loan?.termMonths) return null;
    const startDate = new Date(loan.createdAt);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + loan.termMonths);
    return endDate;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);

  if (loading) {
    return (
      <DashboardLayout activeMenu="My Loans">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout activeMenu="My Loans">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!loan) {
    return (
      <DashboardLayout activeMenu="My Loans">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p>Loan not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const endDate = calculateEndDate();

  return (
    <DashboardLayout activeMenu="My Loans">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Loan Details</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            ← Back to Loans
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <InfoBlock label="Loan ID" value={loan._id} />
                <InfoBlock
                  label="User"
                  value={`${loan?.user?.name || 'N/A'} (${loan?.user?.email || 'N/A'})`}
                />
                <InfoBlock label="Loan Type" value={loan.loanType} capitalize />
                <InfoBlock
                  label="Status"
                  value={
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}
                    >
                      {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                    </span>
                  }
                />
                <InfoBlock
                  label="Date Created"
                  value={format(new Date(loan.createdAt), 'MMMM d, yyyy h:mm a')}
                />
                {endDate && (
                  <InfoBlock
                    label="Projected End Date"
                    value={format(endDate, 'MMMM d, yyyy')}
                  />
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Financial Details</h2>
              <div className="space-y-4">
                <InfoBlock label="Loan Amount" value={formatCurrency(loan.amount)} />
                <InfoBlock label="Interest Rate" value={`${loan.interestRate}%`} />
                <InfoBlock label="Term" value={`${loan.termMonths} months`} />
                <InfoBlock label="Monthly Payment" value={formatCurrency(loan.monthlyPayment)} />
                <InfoBlock label="Total Repayable" value={formatCurrency(loan.totalRepayable)} />
              </div>
            </div>
          </div>
        </div>

        <section className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 border-b-2 border-amber-200 pb-2 mb-4">
            Documents
          </h3>
          {loan.documents?.length > 0 ? (
            <ul className="space-y-2">
              {loan.documents.map((doc, index) => (
                <li key={`${loan._id}-doc-${index}`}>
                  <a
                    href={sanitizeDocumentUrl(doc)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500 hover:text-amber-600 font-medium"
                  >
                    Document {index + 1}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No documents available.</p>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

// Reusable subcomponent for neatness
const InfoBlock = ({ label, value, capitalize = false }) => (
  <div className="border-b pb-4">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className={`mt-1 ${capitalize ? 'capitalize' : ''}`}>{value}</p>
  </div>
);

export default UserLoanDetails;
