import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import {
  FiArrowRight,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import DashboardLayout from "../../Components/layouts/DashboardLayout";

const LoanOffers = () => {
  // State management for loan offers, loading status, and errors
  const [offers, setOffers] = useState([]); // Stores fetched loan offers
  const [loading, setLoading] = useState(true); // Tracks loading state
  const [error, setError] = useState(null); // Stores error messages

  // Filter state with pagination controls
  const [filters, setFilters] = useState({
    page: 1, // Current page number
    limit: 6, // Items per page
    loanType: "", // Filter by loan type
  });

  const [totalPages, setTotalPages] = useState(1); // Total available pages
  const [showFilters, setShowFilters] = useState(false); // Toggle filter visibility
  const navigate = useNavigate(); // Navigation hook for routing

  // Fetch loan offers whenever filters change
  useEffect(() => {
    const fetchLoanOffers = async () => {
      try {
        setLoading(true);
        // Construct query parameters from filters
        const queryParams = new URLSearchParams();
        queryParams.append("page", filters.page);
        queryParams.append("limit", filters.limit);
        if (filters.loanType) queryParams.append("loanType", filters.loanType);

        // API call to get loan offers
        const response = await axiosInstance.get(
          `${API_PATHS.LOANS.GET_LOAN_OFFER}?${queryParams.toString()}`
        );

        // Update state with response data
        setOffers(response.data.data);
        setTotalPages(response.data.meta.totalPages);
      } catch (err) {
        // Handle errors gracefully
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch loan offers"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLoanOffers();
  }, [filters]); // Dependency array ensures effect runs when filters change

  // Handle loan type filter changes
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      loanType: e.target.value,
      page: 1, // Reset to first page when filters change
    });
  };

  // Handle pagination navigation
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setFilters({
        ...filters,
        page: newPage,
      });
      window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to top
    }
  };

  // Format currency as Nigerian Naira
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  // Loading state UI
  if (loading) {
    return (
      <DashboardLayout className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state UI
  if (error) {
    return (
      <DashboardLayout className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
            role="alert"
          >
            <p>{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Main component render
  return (
    <DashboardLayout
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
      activeMenu="Apply for Loan"
    >
      <div className="max-w-7xl mx-auto">
        {/* Page header section */}
        <div className="text-center mb-12">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl mt-5">
            Available Loan Offers
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Choose the perfect loan option for your needs
          </p>
        </div>

        {/* Filter controls section */}
        <div className="mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <FiFilter className="mr-2" />
            Filters
          </button>

          {/* Filter dropdown (conditionally shown) */}
          {showFilters && (
            <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
              <label
                htmlFor="loanType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Loan Type
              </label>
              <select
                id="loanType"
                name="loanType"
                value={filters.loanType}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
              >
                <option value="">All Types</option>
                <option value="personal">Personal Loan</option>
                <option value="business">Business Loan</option>
                <option value="mortgage">Mortgage</option>
                <option value="auto">Auto Loan</option>
              </select>
            </div>
          )}
        </div>

        {/* Loan offers grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <div
              key={offer._id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
            >
              {/* Offer header with loan type */}
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 capitalize">
                    {offer.loanType} Loan
                  </h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Special Offer
                  </span>
                </div>
              </div>
              
              {/* Offer details */}
              <div className="px-6 py-5">
                <div className="mb-4">
                  <p className="text-lg font-semibold text-amber-700">
                    Take Upto{" "}
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(offer.amount)}
                  </p>

                  {/* Document links if available */}
                  {offer.documents && offer.documents.length > 0 && (
                    <p className="text-gray-600 mt-1">
                      <span className="font-semibold">Documents:</span>{" "}
                      {offer.documents.map((doc, index) => (
                        <a
                          key={index}
                          href={`${axiosInstance.defaults.baseURL}/uploads/${doc}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-500 hover:underline"
                        >
                          Doc {index + 1}
                        </a>
                      ))}
                    </p>
                  )}
                </div>

                {/* Loan terms */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Interest Rate</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {offer.interestRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Term</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {offer.termMonths} months
                    </p>
                  </div>
                </div>

                {/* Apply button */}
                <button
                  onClick={() => navigate(`/user/loan-form`)}
                  className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                >
                  Apply Now <FiArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            {/* Previous page button */}
            <button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                filters.page === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FiChevronLeft className="mr-1" /> Previous
            </button>
            
            {/* Page numbers */}
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Calculate which page numbers to show
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (filters.page <= 3) {
                      pageNum = i + 1;
                    } else if (filters.page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = filters.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          filters.page === pageNum
                            ? "z-10 bg-amber-50 border-amber-500 text-amber-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
            
            {/* Next page button */}
            <button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page === totalPages}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                filters.page === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next <FiChevronRight className="ml-1" />
            </button>
          </div>
        )}

        {/* Empty state when no offers match filters */}
        {offers.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No loan offers available
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              There are currently no loan offers matching your criteria.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LoanOffers;