import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import DashboardLayout from "../../Components/layouts/DashboardLayout";

const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLoanDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/api/loan/${id}`);
      console.log("Loan details response:", response.data);
      let loanData = null;
      if (response.data.success && response.data.data) {
        loanData = response.data.data;
      } else if (response.data._id) {
        loanData = response.data;
      }
      if (loanData) {
        setLoan(loanData);
        console.log("Loan state set:", loanData);
      } else {
        console.warn("No valid loan data found in response:", response.data);
        setError({ message: "No valid loan data returned from server" });
      }
    } catch (err) {
      const errorDetails = {
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch loan details",
        status: err.response?.status,
        code: err.code,
        requestUrl: err.config?.url,
      };
      console.error("Fetch error:", errorDetails);
      setError(errorDetails);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanDetails();
  }, [id]);

  const handleCreateTransaction = () => {
    if (loan) {
      const queryParams = new URLSearchParams({
        loan: loan._id,
        user: loan.user?._id || "",
        amount: loan.amount.toFixed(2) || "",
      }).toString();
      navigate(`/admin/transactions?${queryParams}`);
    }
  };

  return (
    <DashboardLayout activeMenu="Manage Loan">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Loan Application Details
          </h2>
          <button
            onClick={() => navigate("/admin/loans")}
            className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-colors duration-200"
          >
            Back to Loans
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md"
            role="alert"
          >
            <p className="font-medium">Error Fetching Loan Details</p>
            <p>{error.message}</p>
            {error.code && (
              <p className="mt-2">
                <span className="font-semibold">Error Code:</span> {error.code}
              </p>
            )}
            {error.requestUrl && (
              <p className="mt-2">
                <span className="font-semibold">Request URL:</span>{" "}
                {error.requestUrl}
              </p>
            )}
            {error.status && (
              <p className="mt-2">
                <span className="font-semibold">Status:</span> {error.status}
              </p>
            )}
            <p className="mt-2 text-sm">
              Please check if the server is running or contact support if the
              issue persists.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
            <p className="mt-3 text-gray-600 text-lg">
              Loading loan details...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !loan && (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-lg">Loan not found.</p>
          </div>
        )}

        {/* Loan Details */}
        {!loading && !error && loan && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* User Information */}
            <section className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 border-b-2 border-amber-200 pb-2 mb-4">
                User Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">User ID:</span>{" "}
                    {loan.user?._id || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">Name:</span>{" "}
                    {loan.user?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">Email:</span>{" "}
                    {loan.user?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">Phone:</span>{" "}
                    {loan.phone || "N/A"}
                  </p>
                </div>
              </div>
            </section>

            {/* Loan Information */}
            <section className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 border-b-2 border-amber-200 pb-2 mb-4">
                Loan Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">Loan ID:</span>{" "}
                    {loan._id || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">Amount:</span> #
                    {loan.amount ? loan.amount.toLocaleString() : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">Loan Type:</span>{" "}
                    {loan.loanType || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">Interest Rate:</span>{" "}
                    {loan.interestRate ? `${loan.interestRate}%` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">Term:</span>{" "}
                    {loan.termMonths ? `${loan.termMonths} months` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">Monthly Payment:</span> #
                    {loan.monthlyPayment
                      ? loan.monthlyPayment.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">Total Repayable:</span> $
                    {loan.totalRepayable
                      ? loan.totalRepayable.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">Repayment Balance:</span> #
                    {loan.repaymentBalance
                      ? loan.repaymentBalance.toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">Status:</span>{" "}
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                        loan.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : loan.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : loan.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {loan.status
                        ? loan.status.charAt(0).toUpperCase() +
                          loan.status.slice(1)
                        : "N/A"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">Applied Date:</span>{" "}
                    {loan.createdAt
                      ? new Date(loan.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </section>

            {/* Bank Information */}
            <section className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 border-b-2 border-amber-200 pb-2 mb-4">
                Bank Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">Bank Name:</span>{" "}
                    {loan.bankName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">Account Name:</span>{" "}
                    {loan.accountName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">Account Number:</span>{" "}
                    {loan.accountNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">BVN:</span>{" "}
                    {loan.BVN || "N/A"}
                  </p>
                </div>
              </div>
            </section>

            {/* Documents */}
            {loan.documents && loan.documents.length > 0 ? (
              <section className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 border-b-2 border-amber-200 pb-2 mb-4">
                  Documents
                </h3>
                <ul className="space-y-2">
                  {loan.documents.map((doc, index) => (
                    <li key={index}>
                      <a
                        href={doc}
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
            {/* Create Transaction Button */}
            <section>
              <button
                onClick={handleCreateTransaction}
                className="bg-amber-500 text-white px-6 py-2 rounded-md hover:bg-amber-600 transition-colors duration-200 w-full sm:w-auto"
              >
                Create Transaction
              </button>
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LoanDetails;
