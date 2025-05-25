import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../Components/layouts/DashboardLayout';

/**
 * LoanApplicationForm Component
 * 
 * This component provides a form for users to apply for loans. It handles:
 * - Fetching available loan offers
 * - Selecting a specific loan offer
 * - Collecting user information and loan details
 * - Validating form inputs
 * - Calculating loan repayment terms
 * - Submitting the loan application
 * - Showing success/error messages
 */
const LoanApplicationForm = () => {
  // Get route parameters and navigation functions
  const { id } = useParams(); // Get loan offer ID from URL params if present
  const location = useLocation(); // Access current route location
  const navigate = useNavigate(); // Navigation function
  const queryParams = new URLSearchParams(location.search); // Parse query parameters
  const preSelectedOfferId = queryParams.get('offerId') || id; // Get offer ID from query params or route params

  // State initialization
  const [loanOffers, setLoanOffers] = useState([]); // Stores available loan offers
  const [selectedOffer, setSelectedOffer] = useState(null); // Currently selected loan offer
  const [formData, setFormData] = useState({ // Form field values
    amount: '',
    reason: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    BVN: '',
    phone: '',
    email: '',
    documents: null
  });
  const [errors, setErrors] = useState({ // Form validation errors
    fetchError: '',
    amount: '',
    reason: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    BVN: '',
    phone: '',
    email: '',
    documents: '',
    submitError: '',
    form: ''
  });
  const [calculation, setCalculation] = useState(null); // Loan calculation results
  const [isSubmitting, setIsSubmitting] = useState(false); // Form submission state
  const [isLoading, setIsLoading] = useState(true); // Data loading state
  const [submitSuccess, setSubmitSuccess] = useState(false); // Submission success state

  // Valid loan types from backend schema
  const validLoanTypes = ['personal', 'business', 'student', 'mortgage', 'car loan', 'quickie loan'];

  /**
   * Fetch loan offers and pre-selected offer when component mounts
   * or when preSelectedOfferId changes
   */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setErrors(prev => ({ ...prev, fetchError: '' }));

      try {
        // Fetch all available loan offers
        const offersResponse = await axiosInstance.get(API_PATHS.LOANS.GET_LOAN_OFFER);
        const offers = Array.isArray(offersResponse.data)
          ? offersResponse.data
          : offersResponse.data?.data || offersResponse.data?.loanOffers || [];

        setLoanOffers(offers);

        // If there's a pre-selected offer ID, fetch its details
        if (preSelectedOfferId) {
          try {
            const offerResponse = await axiosInstance.get(
              API_PATHS.LOANS.LOAN_OFFER_BY_ID(preSelectedOfferId)
            );
            const fullOfferDetails = offerResponse.data?.data || offerResponse.data;
            if (fullOfferDetails) {
              setSelectedOffer(fullOfferDetails);
            } else {
              throw new Error('Offer details not found');
            }
          } catch (offerError) {
            console.error('Error fetching specific offer:', offerError);
            // Fallback: try to find the offer in the list we already fetched
            const offerFromList = offers.find(o => o._id === preSelectedOfferId);
            if (offerFromList) {
              setSelectedOffer(offerFromList);
            } else {
              setErrors(prev => ({
                ...prev,
                fetchError: 'Could not load the selected loan offer details'
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching loan offers:', error);
        setErrors(prev => ({
          ...prev,
          fetchError: error.response?.data?.message || 'Failed to load loan offers. Please try again later.'
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [preSelectedOfferId]);

  /**
   * Handle loan offer selection from dropdown
   * @param {Object} e - Change event from select element
   */
  const handleOfferSelect = (e) => {
    const offerId = e.target.value;
    const offer = loanOffers.find(o => o._id === offerId);
    setSelectedOffer(offer || null);
    setCalculation(null);
    setFormData(prev => ({ ...prev, amount: '' }));
    setErrors(prev => ({ ...prev, amount: '', form: '' }));
  };

  /**
   * Handle input field changes
   * @param {Object} e - Change event from input element
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  /**
   * Handle file upload changes
   * @param {Object} e - Change event from file input
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, documents: 'Please upload a PDF, JPG, or PNG file.' }));
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, documents: 'File size must not exceed 5MB.' }));
        return;
      }
    }
    setFormData(prev => ({ ...prev, documents: file }));
    setErrors(prev => ({ ...prev, documents: '' }));
  };

  /**
   * Validate form fields
   * @returns {boolean} - True if form is valid, false otherwise
   */
  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Validate loan amount
    if (!selectedOffer) {
      newErrors.amount = 'Please select a loan offer first';
      isValid = false;
    } else if (!formData.amount) {
      newErrors.amount = 'Please enter a loan amount';
      isValid = false;
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount)) {
        newErrors.amount = 'Please enter a valid amount';
        isValid = false;
      } else if (amount > selectedOffer.amount) {
        newErrors.amount = `Amount cannot exceed ₦${selectedOffer.amount.toLocaleString()}`;
        isValid = false;
      } else if (amount <= 0) {
        newErrors.amount = 'Amount must be greater than 0';
        isValid = false;
      }
    }

    // Validate required fields
    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide a reason for the loan';
      isValid = false;
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Please enter a bank name';
      isValid = false;
    }
    
    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Please enter an account name';
      isValid = false;
    }

    // Validate account number format (10 digits)
    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Please enter an account number';
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Account number must be 10 digits';
      isValid = false;
    }

    // Validate BVN format (11 digits)
    if (!formData.BVN.trim()) {
      newErrors.BVN = 'Please enter a BVN';
      isValid = false;
    } else if (!/^\d{11}$/.test(formData.BVN)) {
      newErrors.BVN = 'BVN must be 11 digits';
      isValid = false;
    }

    // Validate phone number format
    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter a phone number';
      isValid = false;
    } else if (!/^\+?\d{10,14}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
      isValid = false;
    }

    // Validate email format
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter an email address';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate loan type
    if (selectedOffer && !validLoanTypes.includes(selectedOffer.loanType)) {
      newErrors.form = `Invalid loan type: ${selectedOffer.loanType}. Must be one of: ${validLoanTypes.join(', ')}`;
      isValid = false;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  /**
   * Calculate loan repayment details based on selected offer and amount
   */
  const calculateLoanDetails = () => {
    if (!selectedOffer || !formData.amount) {
      setCalculation(null);
      setErrors(prev => ({ ...prev, form: 'Please select an offer and enter a valid amount' }));
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0 || amount > selectedOffer.amount) {
      setCalculation(null);
      setErrors(prev => ({ ...prev, form: 'Invalid loan amount for calculation' }));
      return;
    }

    // Calculate monthly payment using loan formula
    const monthlyInterestRate = selectedOffer.interestRate / 100 / 12;
    const termMonths = selectedOffer.termMonths;

    const monthlyPayment =
      (amount * monthlyInterestRate) /
      (1 - Math.pow(1 + monthlyInterestRate, -termMonths));
    const totalRepayable = monthlyPayment * termMonths;

    if (isNaN(monthlyPayment) || isNaN(totalRepayable)) {
      setCalculation(null);
      setErrors(prev => ({ ...prev, form: 'Invalid loan calculation. Please check the amount.' }));
      return;
    }

    setCalculation({ monthlyPayment, totalRepayable });
    setErrors(prev => ({ ...prev, form: '' }));
  };

  /**
   * Handle form submission
   * @param {Object} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      setErrors(prev => ({ ...prev, form: 'Please correct the errors in the form.' }));
      return;
    }

    // Calculate loan details
    calculateLoanDetails();

    // Check if calculations are valid
    if (!calculation || isNaN(calculation.monthlyPayment) || isNaN(calculation.totalRepayable)) {
      setErrors(prev => ({
        ...prev,
        form: 'Loan calculations failed. Please check the amount and try again.'
      }));
      return;
    }

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, submitError: '', form: '' }));

    try {
      // Prepare form data for submission
      const formDataToSend = new FormData();

      // Append all required fields
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('duration', selectedOffer.termMonths);
      formDataToSend.append('reason', formData.reason);
      formDataToSend.append('loanType', selectedOffer.loanType);
      formDataToSend.append('interestRate', selectedOffer.interestRate);
      formDataToSend.append('monthlyPayment', calculation.monthlyPayment.toFixed(2));
      formDataToSend.append('totalRepayable', calculation.totalRepayable.toFixed(2));
      formDataToSend.append('bankName', formData.bankName);
      formDataToSend.append('accountName', formData.accountName);
      formDataToSend.append('accountNumber', formData.accountNumber);
      formDataToSend.append('BVN', formData.BVN);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('email', formData.email);

      // Append document if provided
      if (formData.documents) {
        formDataToSend.append('documents', formData.documents);
      }

      // Log FormData for debugging
      console.log('Submitting FormData:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }

      // Submit loan application
      const response = await axiosInstance.post(
        API_PATHS.LOANS.APPLY_LOAN,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Handle successful submission
      if (response.status === 201) {
        setSubmitSuccess(true);
        
        // Reset form state
        setFormData({
          amount: '',
          reason: '',
          bankName: '',
          accountName: '',
          accountNumber: '',
          BVN: '',
          phone: '',
          email: '',
          documents: null
        });
        setCalculation(null);
        setSelectedOffer(null);
        setErrors({
          fetchError: '',
          amount: '',
          reason: '',
          bankName: '',
          accountName: '',
          accountNumber: '',
          BVN: '',
          phone: '',
          email: '',
          documents: '',
          submitError: '',
          form: ''
        });

        // Show success message for 3 seconds before navigating
        setTimeout(() => {
          navigate("/user/apply-loan");
        }, 10000);
      }
    } catch (error) {
      console.error('Detailed error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // Format error message for display
      let errorMessage = 'Failed to submit application. Please try again.';
      if (error.response?.status === 400) {
        if (error.response.data.message.includes('Unexpected field')) {
          errorMessage = `Invalid form data: ${error.response.data.message}`;
        } else if (error.response.data.errors) {
          errorMessage = error.response.data.errors.join(', ');
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error.response?.status === 403) {
        errorMessage = error.response.data.message;
      }

      setErrors(prev => ({
        ...prev,
        submitError: errorMessage
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Check if form is valid for enabling submit button
   * @returns {boolean} - True if form is valid and ready for submission
   */
  const isFormValid = () => {
    return (
      selectedOffer &&
      validLoanTypes.includes(selectedOffer.loanType) &&
      formData.amount &&
      !isNaN(parseFloat(formData.amount)) &&
      parseFloat(formData.amount) > 0 &&
      parseFloat(formData.amount) <= selectedOffer.amount &&
      formData.reason.trim() &&
      formData.bankName.trim() &&
      formData.accountName.trim() &&
      /^\d{10}$/.test(formData.accountNumber) &&
      /^\d{11}$/.test(formData.BVN) &&
      /^\+?\d{10,14}$/.test(formData.phone.replace(/\s/g, '')) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      calculation &&
      !isNaN(calculation.monthlyPayment) &&
      !isNaN(calculation.totalRepayable)
    );
  };

  return (
    <DashboardLayout activeMenu="Apply For Loan" className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Loan Application Form</h1>
          <button
            onClick={() => navigate("/user/apply-loan")}
            className="text-m text-amber-600 hover:text-amber-800"
          >
            ← Back to all offers
          </button>
        </div>

        {/* Error and success messages */}
        {errors.fetchError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errors.fetchError}
          </div>
        )}

        {submitSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold">Loan Application Submitted Successfully!</p>
                <p className="text-sm">Your application is being processed. You'll be redirected shortly...</p>
              </div>
            </div>
          </div>
        )}

        {errors.form && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errors.form}
          </div>
        )}

        {/* Loan offer selection */}
        <div className="mb-6">
          <label htmlFor="loanOffer" className="block text-sm font-medium text-gray-700 mb-1">
            Select Loan Offer:
          </label>
          {isLoading ? (
            <div className="animate-pulse flex items-center justify-center h-10 bg-gray-200 rounded">
              <span>Loading loan offers...</span>
            </div>
          ) : (
            <select
              id="loanOffer"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-600 focus:border-amber-600"
              onChange={handleOfferSelect}
              value={selectedOffer?._id || ''}
              disabled={isLoading || isSubmitting}
            >
              <option value="">-- Select a loan offer --</option>
              {Array.isArray(loanOffers) && loanOffers.length > 0 ? (
                loanOffers.map(offer => (
                  <option key={offer._id} value={offer._id}>
                    {offer.loanType} - ₦{offer.amount?.toLocaleString()} ({offer.termMonths} months @ {offer.interestRate}%)
                  </option>
                ))
              ) : (
                <option value="" disabled>No loan offers available</option>
              )}
            </select>
          )}
        </div>

        {/* Selected offer details */}
        {selectedOffer && (
          <div className="bg-amber-400 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Loan Offer Details</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-gray-600">Loan Type:</p>
                <p className="font-medium">{selectedOffer.loanType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Maximum Amount:</p>
                <p className="font-medium">₦{selectedOffer.amount?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Term Months:</p>
                <p className="font-medium">{selectedOffer.termMonths}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Interest Rate:</p>
                <p className="font-medium">{selectedOffer.interestRate}%</p>
              </div>
            </div>
            {selectedOffer.description && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">Description:</p>
                <p className="font-medium">{selectedOffer.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Loan application form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Loan amount field */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Loan Amount (₦):
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              className={`w-full px-3 py-2 border ${errors.amount ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500`}
              value={formData.amount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || parseFloat(value) >= 0) {
                  handleInputChange(e);
                }
              }}
              onBlur={() => {
                validateForm();
                calculateLoanDetails();
              }}
              max={selectedOffer?.amount || ''}
              min="0"
              step="0.01"
              required
              disabled={!selectedOffer || isSubmitting}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Loan reason field */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Loan:
            </label>
            <textarea
              id="reason"
              name="reason"
              rows="3"
              className={`w-full px-3 py-2 border ${errors.reason ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500`}
              value={formData.reason}
              onChange={handleInputChange}
              onBlur={validateForm}
              required
              disabled={isSubmitting}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Bank details section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name:
              </label>
              <input
                type="text"
                id="bankName"
                name="bankName"
                className={`w-full px-3 py-2 border ${errors.bankName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500`}
                value={formData.bankName}
                onChange={handleInputChange}
                onBlur={validateForm}
                required
                disabled={isSubmitting}
              />
              {errors.bankName && (
                <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
              )}
            </div>
            <div>
              <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">
                Account Name:
              </label>
              <input
                type="text"
                id="accountName"
                name="accountName"
                className={`w-full px-3 py-2 border ${errors.accountName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500`}
                value={formData.accountName}
                onChange={handleInputChange}
                onBlur={validateForm}
                required
                disabled={isSubmitting}
              />
              {errors.accountName && (
                <p className="mt-1 text-sm text-red-600">{errors.accountName}</p>
              )}
            </div>
          </div>

          {/* Account details section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Account Number:
              </label>
              <input
                type="text"
                id="accountNumber"
                name="accountNumber"
                className={`w-full px-3 py-2 border ${errors.accountNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500`}
                value={formData.accountNumber}
                onChange={handleInputChange}
                onBlur={validateForm}
                required
                disabled={isSubmitting}
              />
              {errors.accountNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
              )}
            </div>
            <div>
              <label htmlFor="BVN" className="block text-sm font-medium text-gray-700 mb-1">
                Bank Verification Number (BVN):
              </label>
              <input
                type="text"
                id="BVN"
                name="BVN"
                className={`w-full px-3 py-2 border ${errors.BVN ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500`}
                value={formData.BVN}
                onChange={handleInputChange}
                onBlur={validateForm}
                required
                disabled={isSubmitting}
              />
              {errors.BVN && (
                <p className="mt-1 text-sm text-red-600">{errors.BVN}</p>
              )}
            </div>
          </div>

          {/* Contact information section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number:
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className={`w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500`}
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={validateForm}
                required
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500`}
                value={formData.email}
                onChange={handleInputChange}
                onBlur={validateForm}
                required
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Document upload section */}
          <div>
            <label htmlFor="documents" className="block text-sm font-medium text-gray-700 mb-1">
              Upload Supporting Documents:
            </label>
            <input
              type="file"
              id="documents"
              name="documents"
              className={`w-full px-3 py-2 border ${errors.documents ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500`}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">PDF, JPG, or PNG (Max 5MB)</p>
            {errors.documents && (
              <p className="mt-1 text-sm text-red-600">{errors.documents}</p>
            )}
          </div>

          {/* Loan calculation results */}
          {calculation && (
            <div className="bg-amber-500 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Loan Calculation</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Monthly Payment:</p>
                  <p className="font-medium">₦{calculation.monthlyPayment?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount to Repay:</p>
                  <p className="font-medium">₦{calculation.totalRepayable?.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submission error message */}
          {errors.submitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.submitError}
            </div>
          )}

          {/* Submit button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
              disabled={isSubmitting || !isFormValid() || isLoading}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default LoanApplicationForm;