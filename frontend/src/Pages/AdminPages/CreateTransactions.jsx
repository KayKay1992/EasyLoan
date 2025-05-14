import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../Components/layouts/DashboardLayout";
import toast from "react-hot-toast";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";

const TransactionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState({
    user: "",
    loan: "",
    amount: "",
    type: "",
    method: "",
  });
  const [loading, setLoading] = useState(false);
  const [loanStatus, setLoanStatus] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // Pre-fill form with query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const user = params.get("user") || "";
    const loan = params.get("loan") || "";
    const amount = params.get("amount") || "";
    const type = params.get("type") || "payment";
    const method = params.get("method") || "bank";
    setTransaction((prev) => ({
      ...prev,
      user,
      loan,
      amount,
      type,
      method,
    }));
  }, [location.search]);

  // Fetch loan status when loan ID is available
  useEffect(() => {
    const fetchLoanStatus = async () => {
      if (transaction.loan) {
        try {
          const response = await axiosInstance.get(
            `/api/loan/${transaction.loan}`
          );
          const loanData = response.data.data || response.data;
          setLoanStatus(loanData.status);
          console.log("Loan status:", loanData.status);
        } catch (err) {
          console.error("Fetch loan status error:", err);
          toast.error("Failed to fetch loan status.");
          setLoanStatus(null);
        }
      }
    };
    fetchLoanStatus();
  }, [transaction.loan]);

  const fetchAllTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const response = await axiosInstance.get(
        API_PATHS.TRANSACTION.GET_ALL_TRANSACTIONS
      );

      const data = response.data.transactions || [];

      console.log("Transactions API response:", data);

      setTransactions(Array.isArray(data) ? data : []);
      toast.success("Transactions loaded successfully");
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
      setTransactions([]); // fallback to empty array on error
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setTransaction((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTransactions = () => {
    if (!showTransactions) {
      fetchAllTransactions();
    }
    setShowTransactions(!showTransactions);
  };

  const createTransaction = async () => {
    setLoading(true);
    const { user, loan, amount, type, method } = transaction;

    if (!user || !loan || !amount || !type || !method) {
      toast.error("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (Number(amount) <= 0) {
      toast.error("Amount must be a positive number.");
      setLoading(false);
      return;
    }

    try {
      const transactionPayload = {
        user,
        loan,
        amount: Number(amount),
        type: type === "payment" ? "repayment" : type,
        method,
      };

      const response = await axiosInstance.post(
        API_PATHS.TRANSACTION.CREATE_TRANSACTION,
        transactionPayload
      );
      toast.success("Transaction created successfully!");
      setTransaction({ user: "", loan: "", amount: "", type: "", method: "" });
      console.log("Transaction created:", response.data);
      navigate("/admin/loans");
    } catch (err) {
      console.error("Create transaction error:", err);
      toast.error(
        err.response?.data?.message || "Failed to create transaction"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (loanStatus === "rejected") {
      toast.error("Cannot approve a rejected loan.");
      return;
    }
    if (loanStatus === "active") {
      toast.error("Cannot approve an already active loan.");
      return;
    }

    setLoading(true);
    const { user, loan, amount, method } = transaction;

    if (!user || !loan || !amount || !method) {
      toast.error("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (user.length < 6 || loan.length < 6) {
      toast.error("User ID and Loan ID must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (Number(amount) <= 0) {
      toast.error("Amount must be a positive number.");
      setLoading(false);
      return;
    }

    try {
      setTransaction((prev) => ({ ...prev, type: "disbursement" }));
      await createTransaction();
      toast.success("Loan approved and disbursed!");
    } catch (error) {
      console.error("Approve error:", error);
      toast.error(error.response?.data?.message || "Failed to disburse loan");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (loanStatus === "active") {
      toast.error("Cannot reject an active loan.");
      return;
    }
    if (loanStatus === "rejected") {
      toast.error("Loan is already rejected.");
      return;
    }

    setLoading(true);
    const { user, loan } = transaction;

    if (!user || !loan) {
      toast.error(
        "User ID and Loan ID are required to reject the transaction."
      );
      setLoading(false);
      return;
    }

    if (user.length < 6 || loan.length < 6) {
      toast.error("User ID and Loan ID must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.LOANS.REJECT_LOAN(loan));
      toast.success("Loan rejected successfully!");
      setTransaction({ user: "", loan: "", amount: "", type: "", method: "" });
      navigate("/admin/loans");
    } catch (error) {
      console.error("Reject error:", error);
      toast.error(error.response?.data?.message || "Failed to reject loan");
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <DashboardLayout activeMenu="Transactions">
      <div className="max-w-4xl mx-auto mt-10">
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Create Transaction
          </h2>

          <div className="space-y-5">
            {/* User ID */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                User ID
              </label>
              <input
                type="text"
                value={transaction.user}
                onChange={(e) => handleChange("user", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-amber-500 transition"
                placeholder="Enter user ID"
                disabled={!!transaction.user}
              />
            </div>

            {/* Loan ID */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Loan ID
              </label>
              <input
                type="text"
                value={transaction.loan}
                onChange={(e) => handleChange("loan", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-amber-500 transition"
                placeholder="Enter loan ID"
                disabled={!!transaction.loan}
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Amount (₦)
              </label>
              <input
                type="number"
                value={transaction.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-amber-500 transition"
                placeholder="Enter amount"
                step="0.01"
              />
            </div>

            {/* Transaction Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Transaction Type
              </label>
              <select
                value={transaction.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-amber-500 transition"
              >
                <option value="">Select type</option>
                <option value="disbursement">Disbursement</option>
                <option value="repayment">Repayment</option>
                <option value="reversal">Reversal</option>
              </select>
            </div>

            {/* Method Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Method
              </label>
              <select
                value={transaction.method}
                onChange={(e) => handleChange("method", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-amber-500 transition"
              >
                <option value="">Select method</option>
                <option value="bank">Bank</option>
                <option value="card">Card</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="cash">Cash</option>
                <option value="bank transfer">Bank Transfer</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={handleApprove}
                disabled={
                  loading ||
                  loanStatus === "rejected" ||
                  loanStatus === "active"
                }
                className={`bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition ${
                  loading ||
                  loanStatus === "rejected" ||
                  loanStatus === "active"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {loading ? "Processing..." : "Approve & Disburse"}
              </button>
              <button
                onClick={handleReject}
                disabled={
                  loading ||
                  loanStatus === "active" ||
                  loanStatus === "rejected"
                }
                className={`bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition ${
                  loading ||
                  loanStatus === "active" ||
                  loanStatus === "rejected"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {loading ? "Processing..." : "Reject"}
              </button>
              <button
                onClick={() => navigate("/admin/loans")}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold px-6 py-3 rounded-xl shadow-md transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Show All Transactions Button */}
        <div className="text-center mb-8">
          <button
            onClick={toggleTransactions}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition flex items-center justify-center mx-auto"
          >
            {showTransactions ? "Hide Transactions" : "Show All Transactions"}
            <svg
              className={`ml-2 w-4 h-4 transition-transform ${
                showTransactions ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Transactions Panel */}
        <AnimatePresence>
          {showTransactions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 overflow-hidden"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                All Transactions
              </h3>

              {transactionsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No transactions found
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {transactions.map((txn) => (
                    <motion.div
                      key={txn._id}
                      variants={itemVariants}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Transaction ID
                          </p>
                          <p className="font-medium">{txn._id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="font-medium">
                            ₦{txn.amount?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Type</p>
                          <p className="font-medium capitalize">{txn.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Method</p>
                          <p className="font-medium capitalize">{txn.method}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="font-medium capitalize">
                            {txn.status || "completed"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium">
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* ✅ Fixed Loan Details Block */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-500">Loan Details</p>
                        {txn.loan ? (
                          <p className="font-medium">
                            ID: {txn.loan._id} | Amount: ₦
                            {txn.loan.amount?.toLocaleString()} | Status:{" "}
                            {txn.loan.status}
                          </p>
                        ) : (
                          <p className="text-gray-400">No loan data</p>
                        )}
                      </div>

                      {/* ✅ Optional: User Info */}
                      {txn.user && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-500">User</p>
                          <p className="font-medium">
                            {txn.user.name} ({txn.user.email})
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default TransactionPage;
