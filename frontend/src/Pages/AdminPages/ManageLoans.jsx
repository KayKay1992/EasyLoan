import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import DashboardLayout from "../../Components/layouts/DashboardLayout";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

const ManageLoans = () => {
  const [loans, setLoans] = useState([]);
  const [isLoanOffers, setIsLoanOffers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = isLoanOffers
        ? API_PATHS.LOANS.GET_LOAN_OFFER
        : API_PATHS.LOANS.GET_ALL_LOANS;
      console.log("Fetching from:", endpoint);
      const response = await axiosInstance.get(endpoint, {
        params: { page: 1, limit: 10 },
      });
      console.log("API response:", response.data);
      setLoans(response.data.data || []);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch loans";
      console.error("Fetch error:", {
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(errorMessage);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [isLoanOffers]);

  const handleToggle = () => {
    setIsLoanOffers(!isLoanOffers);
  };

const handleDeleteOffer = async (loanId) => {
  if (!window.confirm("Are you sure you want to delete this loan offer?")) {
    return;
  }
  try {
    // Use the DELETE_LOAN_OFFER path from API_PATHS
    await axiosInstance.delete(API_PATHS.LOANS.DELETE_LOAN_OFFER(loanId));
    toast.success("Loan offer deleted successfully!");
    fetchLoans(); // Refresh the list
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || "Failed to delete loan offer";
    console.error("Delete error:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
      config: err.config
    });
    toast.error(errorMessage);
  }
};

const handleUpdateOffer = (loan) => {
  navigate(`/admin/create-loan`, {
    state: {
      isEditMode: true,
      loanData: {  // Ensure this matches your expected structure
        _id: loan._id,
        amount: loan.amount,
        loanType: loan.loanType,
        interestRate: loan.interestRate,
        termMonths: loan.termMonths,
        // Don't include document here as it needs re-upload
      }
    }
  });
};
  return (
    <DashboardLayout activeMenu="Manage Loan">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {isLoanOffers ? "Loan Offers" : "Applied Loans"}
          </h2>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span className="text-sm font-medium text-gray-600">
              {isLoanOffers ? "Show Applied Loans" : "Show Loan Offers"}
            </span>
            <button
              onClick={handleToggle}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out ${
                isLoanOffers ? "bg-amber-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
                  isLoanOffers ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-6">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}

        {!loading && !error && loans.length === 0 && (
          <div className="text-center py-6 text-gray-600">
            No {isLoanOffers ? "loan offers" : "applied loans"} found.
          </div>
        )}

        {!loading && !error && loans.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loans.map((loan) => (
              <div
                key={loan._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
              >
                {isLoanOffers ? (
                  <>
                    <h3 className="text-lg font-medium text-gray-800">
                      {loan.loanType}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      <span className="font-semibold">Amount:</span> ₦
                      {loan.amount.toLocaleString()}
                    </p>
                    <p className="text-gray-600 mt-1">
                      <span className="font-semibold">Interest Rate:</span>{" "}
                      {loan.interestRate}%
                    </p>
                    <p className="text-gray-600 mt-1">
                      <span className="font-semibold">Term:</span>{" "}
                      {loan.termMonths} months
                    </p>
                   {loan.documents && loan.documents.length > 0 && (
  <p className="text-gray-600 mt-1">
    <span className="font-semibold">Documents:</span>{" "}
    {loan.documents.map((doc, index) => (
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
                    <p className="text-gray-500 text-sm mt-2">
                      Created: {new Date(loan.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => handleUpdateOffer(loan)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition-colors duration-200"
                      >
                        Update Offer
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(loan._id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-md transition-colors duration-200"
                      >
                        Delete Offer
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-gray-800">
                      {loan.user?.name || "Unknown User"}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      <span className="font-semibold">Amount:</span> ₦
                      {loan.amount.toLocaleString()}
                    </p>
                    <p className="text-gray-600 mt-1">
                      <span className="font-semibold">Status:</span>{" "}
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          loan.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : loan.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {loan.status}
                      </span>
                    </p>
                    <p className="text-gray-600 mt-1">
                      <span className="font-semibold">Loan Type:</span>{" "}
                      {loan.loanType || "N/A"}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Applied: {new Date(loan.createdAt).toLocaleDateString()}
                    </p>
                    <button
                      className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-md transition-colors duration-200"
                      onClick={() =>
                        navigate(`/admin/loan-details/${loan._id}`)
                      }
                    >
                      View Details
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageLoans;
