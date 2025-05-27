import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from '../../Components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';

const CreateRepayment = () => {
    // const { userId } = useParams();
  const navigate = useNavigate();

  // Inside your component:
const { user } = useContext(UserContext);
const userId = user?._id; // Get from context instead of params
  const [loanId, setLoanId] = useState('');
  const [loan, setLoan] = useState(null);
  const [formData, setFormData] = useState({
    amountPaid: '',
    paymentMethod: 'bank',
    evidence: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLoan, setIsLoadingLoan] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({
    loanId: '',
    amountPaid: '',
    evidence: ''
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Fetch loan details
  const fetchLoanDetails = async () => {
    if (!loanId.trim()) {
      setErrors(prev => ({ ...prev, loanId: 'Please enter a valid Loan ID' }));
      return;
    }
    setErrors(prev => ({ ...prev, loanId: '' }));
    setIsLoadingLoan(true);
    try {
      const response = await axiosInstance.get(API_PATHS.LOANS.GET_LOAN_BY_ID(loanId), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setLoan(response.data);
      toast.success('Loan details loaded successfully');
    } catch (error) {
      setLoan(null);
      const message = error.response?.data?.message || error.message || 'Failed to fetch loan details';
      toast.error(message);
    } finally {
      setIsLoadingLoan(false);
    }
  };

  // Handle loan ID search
  const handleSearchLoan = (e) => {
    e.preventDefault();
    fetchLoanDetails();
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, evidence: 'Only JPG, PNG, or PDF files are allowed' }));
        toast.error('Only JPG, PNG, or PDF files are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, evidence: 'File size must be less than 5MB' }));
        toast.error('File size must be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, evidence: file }));
      setErrors(prev => ({ ...prev, evidence: '' }));
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setPreviewImage(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreviewImage(null);
      }
    }
  };

  // Calculate maximum allowed payment
  const calculateMaxPayment = () => {
    if (!loan) return 0;
    return Math.ceil(loan.repaymentBalance * 1.01);
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.amountPaid) {
      newErrors.amountPaid = 'Please enter an amount';
      isValid = false;
    } else {
      const amount = Number(formData.amountPaid);
      if (isNaN(amount) || amount < 1) {
        newErrors.amountPaid = 'Amount must be at least 1';
        isValid = false;
      } else if (amount > calculateMaxPayment()) {
        newErrors.amountPaid = `Amount cannot exceed ${formatCurrency(calculateMaxPayment())}`;
        isValid = false;
      }
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loan) {
      toast.error('Please load a valid loan first');
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (['rejected', 'pending', 'completed'].includes(loan.status)) {
      toast.error(`This loan is ${loan.status} and cannot accept repayments`);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token missing');
        navigate('/login');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('loanId', loan._id);
      formDataToSend.append('amountPaid', Math.ceil(Number(formData.amountPaid)));
      formDataToSend.append('paymentMethod', formData.paymentMethod);
      formDataToSend.append('paymentDate', new Date().toISOString());
      // Use next due date or loan.endDate for partial repayments
      formDataToSend.append('dueDate', loan.endDate);

      if (formData.evidence) {
        formDataToSend.append('evidence', formData.evidence);
      }

      console.log('Submitting FormData:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }

      await axiosInstance.post(
        API_PATHS.REPAYMENT.CREATE_REPAYMENT,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success('Repayment submitted successfully!');
      setTimeout(() => navigate('/user/loans'), 3000);
    } catch (error) {
      console.error('Repayment error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      let message = 'Payment failed. Please try again.';
      if (error.response?.status === 400) {
        message = error.response.data.message;
        if (error.response.data.message.includes('Unexpected field')) {
          message = `Invalid form field: ${error.response.data.message}`;
        }
      } else if (error.response?.status === 401) {
        message = 'Unauthorized: Please log in again.';
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.status === 403) {
        message = error.response.data.message;
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout activeMenu='Repayments' className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Make a Loan Repayment</h1>
          <p className="mt-2 text-lg text-gray-600">
            Enter your loan ID to begin repayment process
          </p>
              <button
                        onClick={() => navigate(`/repayments/${user?._id}`)}
                        className="text-amber-600 hover:text-amber-900 border border-amber-600 hover:bg-blue-50 px-3 py-1 rounded-md text-sm mt-5"
                      >
                        View All Repayments
                      </button>
        </div>

        {/* Loan ID Search Form */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4">
            <form onSubmit={handleSearchLoan} className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={loanId}
                  onChange={(e) => setLoanId(e.target.value)}
                  placeholder="Enter Loan ID"
                  className={`block w-full px-3 py-2 rounded-md border ${errors.loanId ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm`}
                  required
                  aria-label="Loan ID"
                />
                {errors.loanId && (
                  <p className="mt-1 text-sm text-red-600">{errors.loanId}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoadingLoan}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                aria-label="Search loan"
              >
                {isLoadingLoan ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>
        </div>

        {loan && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Loan Summary Section */}
            <div className={`px-6 py-4 ${
              loan.status === 'rejected' ? 'bg-red-600' :
              loan.status === 'pending' ? 'bg-yellow-600' :
              loan.status === 'completed' ? 'bg-green-600' :
              'bg-amber-700'
            }`}>
              <h2 className="text-xl font-semibold text-white">
                Loan Summary
                {loan.status === 'rejected' && ' (Rejected)'}
                {loan.status === 'pending' && ' (Pending)'}
                {loan.status === 'completed' && ' (Completed)'}
              </h2>
            </div>

            {/* Status Alert */}
            {['rejected', 'pending', 'completed'].includes(loan.status) && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                <p>
                  This loan is {loan.status === 'pending' ? 'pending approval' : loan.status} and cannot accept repayments.
                </p>
              </div>
            )}

            {/* Loan Details */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Loan Amount</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(loan.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Outstanding Balance</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(loan.repaymentBalance)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Due Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(loan.endDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Interest Rate</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {loan.interestRate}%
                  </p>
                </div>
              </div>
            </div>

            {/* Repayment Form */}
            <form onSubmit={handleSubmit} className="px-6 py-4">
              <fieldset
                disabled={['rejected', 'pending', 'completed'].includes(loan.status)}
                className={['rejected', 'pending', 'completed'].includes(loan.status) ? 'opacity-50' : ''}
              >
                <div className="space-y-6">
                  {/* Amount Field */}
                  <div>
                    <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700">
                      Amount to Pay (Whole numbers only)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₦</span>
                      </div>
                      <input
                        type="number"
                        name="amountPaid"
                        id="amountPaid"
                        value={formData.amountPaid}
                        onChange={handleChange}
                        className={`block w-full pl-7 pr-12 sm:text-sm border ${errors.amountPaid ? 'border-red-500' : 'border-gray-300'} rounded-md py-3 focus:ring-amber-500 focus:border-amber-500`}
                        placeholder="0"
                        min="1"
                        max={calculateMaxPayment()}
                        step="1"
                        required
                        aria-label="Amount to pay"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            amountPaid: Math.ceil(loan.repaymentBalance)
                          }))}
                          className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-r-md hover:bg-amber-200"
                          disabled={['rejected', 'pending', 'completed'].includes(loan.status)}
                          aria-label="Pay full balance"
                        >
                          Pay Full
                        </button>
                      </div>
                    </div>
                    {errors.amountPaid && (
                      <p className="mt-1 text-sm text-red-600">{errors.amountPaid}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      Maximum payment: {formatCurrency(calculateMaxPayment())} (includes 1% tolerance)
                    </p>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                      Payment Method
                    </label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                      aria-label="Payment method"
                    >
                      <option value="bank">Bank Transfer</option>
                      <option value="card">Credit/Debit Card</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="cash">Cash Deposit</option>
                    </select>
                  </div>

                  {/* Payment Date */}
                  <input type="hidden" name="paymentDate" value={new Date().toISOString()} />

                  {/* Evidence Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Payment Evidence
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {previewImage ? (
                          <div className="mt-2">
                            <img
                              src={previewImage}
                              alt="Payment evidence preview"
                              className="mx-auto h-32 object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewImage(null);
                                setFormData(prev => ({ ...prev, evidence: null }));
                              }}
                              className="mt-2 text-sm text-red-600 hover:text-red-800"
                              disabled={['rejected', 'pending', 'completed'].includes(loan.status)}
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="evidence"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none"
                              >
                                <span>Upload a file</span>
                                <input
                                  id="evidence"
                                  name="evidence"
                                  type="file"
                                  className="sr-only"
                                  onChange={handleFileChange}
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  disabled={['rejected', 'pending', 'completed'].includes(loan.status)}
                                  aria-label="Upload payment evidence"
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs  text-gray-500">
                              PNG, JPG, PDF up to 4MB
                            </p>
                            {errors.evidence && (
                              <p className="mt-1 text-sm text-red-600">{errors.evidence}</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions -->*/}
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || ['rejected', 'pending', 'completed'].includes(loan.status)}
                    className="flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-700 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                    aria-label="Submit payment"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Submit Payment'
                    )}
                  </button>
                </div>
              </fieldset>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreateRepayment;