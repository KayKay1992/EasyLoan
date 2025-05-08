import React, { useState } from "react";
import DashboardLayout from "../../Components/layouts/DashboardLayout";
import toast from "react-hot-toast";

const TransactionPage = () => {
  const [transaction, setTransaction] = useState({
    user: "",
    loan: "",
    amount: "",
    type: "",      // dropdown: disbursement, repayment, reversal
    method: "",    // dropdown: bank, cash, wallet
  });

  const handleChange = (key, value) => {
    setTransaction((prev) => ({ ...prev, [key]: value }));
  };

  const handleApprove = async () => {
    const { user, loan, amount, type, method } = transaction;

    if (!user || !loan || !amount || !type || !method) {
      toast.error("Please fill in all fields.");
      return;
    }
  
    if (user.length < 6 || loan.length < 6) {
      toast.error("User ID and Loan ID must be at least 6 characters.");
      return ;
    }
  
    if (Number(amount) <= 0) {
      toast.error("Amount must be a positive number.");
      return ;
    }
  
    try {
      console.log("Loan approved and disbursed", transaction);
      toast.success("Loan approved and disbursed!");
      setTransaction({ user: "", loan: "", amount: "", method: "" });
    } catch (error) {
      toast.error("Failed to disburse loan");
    }
  };

  const handleReject = async () => {
    const { user, loan } = transaction;

    if (!user || !loan) {
      toast.error("User ID and Loan ID are required to reject the transaction.");
      return;
    }
  
    if (user.length < 6 || loan.length < 6) {
      toast.error("User ID and Loan ID must be at least 6 characters.");
      return;
    }
   
    try {
      console.log("Loan rejected", transaction);
      toast.success("Loan rejected");
    } catch (error) {
      toast.error("Failed to reject loan");
    }
  };

  return (
    <DashboardLayout activeMenu="Transactions">
      <div className="max-w-2xl mx-auto mt-10 bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Transaction</h2>

        <div className="space-y-5">
          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">User ID</label>
            <input
              type="text"
              value={transaction.user}
              onChange={(e) => handleChange("user", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-amber-700 transition"
              placeholder="Enter user ID"
            />
          </div>

          {/* Loan ID */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Loan ID</label>
            <input
              type="text"
              value={transaction.loan}
              onChange={(e) => handleChange("loan", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-amber-700 transition"
              placeholder="Enter loan ID"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Amount (₦)</label>
            <input
              type="number"
              value={transaction.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-amber-700 transition"
              placeholder="Enter amount"
            />
          </div>

          {/* Transaction Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Transaction Type</label>
            <select
              value={transaction.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-amber-700 transition"
            >
              <option value="">Select type</option>
              <option value="disbursement">Disbursement</option>
              <option value="payment">Payment</option>
              <option value="refund">Refund</option>
            </select>
          </div>

          {/* Method Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Method</label>
            <select
              value={transaction.method}
              onChange={(e) => handleChange("method", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-amber-700 transition"
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
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition"
            >
              Approve & Disburse
            </button>
            <button
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TransactionPage;
