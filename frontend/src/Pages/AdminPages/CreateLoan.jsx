import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../../Components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const CreateLoan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get edit mode and existing loan data from navigation state
  const { isEditMode, loanData: editData } = location.state || {};
  
  const [loanData, setLoanData] = useState({
    amount: "",
    loanType: "",
    interestRate: "",
    termMonths: "",
    document: null, // Document not pre-filled for security
  });
  const [loading, setLoading] = useState(false);

  // Pre-fill form when in edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      setLoanData({
        amount: editData.amount?.toString() || "",
        loanType: editData.loanType || "",
        interestRate: editData.interestRate?.toString() || "",
        termMonths: editData.termMonths?.toString() || "",
        document: null, // Document requires fresh upload even in edit mode
      });
    }
  }, [isEditMode, editData]);

  const handleChange = (key, value) => {
    setLoanData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    // Validate all fields
    const { amount, loanType, interestRate, termMonths } = loanData;
    if (!amount || !loanType || !interestRate || !termMonths) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid loan amount.");
      return;
    }
    if (isNaN(interestRate) || interestRate <= 0) {
      toast.error("Enter a valid interest rate.");
      return;
    }
    if (isNaN(termMonths) || termMonths <= 0) {
      toast.error("Enter a valid term in months.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("amount", loanData.amount);
      formData.append("loanType", loanData.loanType);
      formData.append("interestRate", loanData.interestRate);
      formData.append("termMonths", loanData.termMonths);
      
      if (loanData.document) {
        formData.append("document", loanData.document);
      }

      const config = {
        headers: { "Content-Type": "multipart/form-data" }
      };

      // Conditional API call for create vs update
      if (isEditMode) {
        // UPDATE existing loan
        await axiosInstance.put(
          API_PATHS.LOANS.UPDATE_LOAN(editData._id), // Include loan ID in endpoint
          formData,
          config
        );
        toast.success("Loan updated successfully!");
      } else {
        // CREATE new loan
        await axiosInstance.post(
          API_PATHS.LOANS.CREATE_LOAN,
          formData,
          config
        );
        toast.success("Loan created successfully!");
      }

      navigate("/admin/loans");
    } catch (err) {
      console.error("Operation error:", err);
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeMenu="Create Loan">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-10 mt-10 border border-gray-100">
        {/* Dynamic header based on mode */}
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          {isEditMode ? "Update Loan Offer" : "Create a New Loan"}
        </h2>

        <div className="space-y-6">
          {/* Form fields remain the same for both modes */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Amount (₦)</label>
            <input
              type="number"
              value={loanData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              placeholder="e.g. 50000"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
            />
          </div>

          {/* Loan Type dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Loan Type</label>
            <select
              value={loanData.loanType}
              onChange={(e) => handleChange("loanType", e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-amber-500 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
              required
            >
              <option value="">Select Loan Type</option>
              <option value="personal">Personal</option>
              <option value="business">Business</option>
              <option value="student">Student</option>
              <option value="mortgage">Mortgage</option>
              <option value="car loan">Car Loan</option>
              <option value="quickie loan">Quickie Loan</option>
            </select>
          </div>

          {/* Interest Rate & Term */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Interest Rate (%)</label>
              <input
                type="number"
                value={loanData.interestRate}
                onChange={(e) => handleChange("interestRate", e.target.value)}
                placeholder="e.g. 5"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Term (months)</label>
              <input
                type="number"
                value={loanData.termMonths}
                onChange={(e) => handleChange("termMonths", e.target.value)}
                placeholder="e.g. 12"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
              />
            </div>
          </div>

          {/* Document upload with conditional label */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {isEditMode ? "Update Document (optional)" : "Attach Document"}
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={(e) => handleChange("document", e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-700 file:text-white hover:file:bg-amber-800 transition duration-200"
            />
            {loanData.document && (
              <p className="mt-1 text-sm text-green-700">
                Selected: {loanData.document.name}
              </p>
            )}
          </div>

          {/* Submit button with dynamic text */}
          <div className="pt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-md transition duration-200 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading 
                ? isEditMode 
                  ? "Updating..." 
                  : "Submitting..." 
                : isEditMode 
                  ? "Update Loan" 
                  : "Create Loan"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateLoan;