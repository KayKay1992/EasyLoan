import React, { useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../../Components/layouts/DashboardLayout";

const CreateLoan = () => {
  const [loanData, setLoanData] = useState({
    loanName: "",
    amount: "",
    loanType: "",
    interestRate: "",
    tenure: "",
    description: "",
    document: null, // added
  });

  const handleChange = (key, value) => {
    setLoanData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const { loanName, amount, loanType, interestRate, tenure, description } =
      loanData;

    // Basic Validation
    if (
      !loanName ||
      !amount ||
      !loanType ||
      !interestRate ||
      !tenure ||
      !description
    ) {
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

    if (isNaN(tenure) || tenure <= 0) {
      toast.error("Enter a valid tenure in months.");
      return;
    }

    try {
      console.log("Creating loan:", loanData);
      toast.success("Loan created successfully!");
      setLoanData({
        loanName: "",
        amount: "",
        loanType: "",
        interestRate: "",
        tenure: "",
        description: "",
      });
    } catch (err) {
      toast.error("Failed to create loan");
    }
  };

  return (
    <DashboardLayout activeMenu="Create Loan">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-10 mt-10 border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Create a New Loan
        </h2>

        <div className="space-y-6">
          {/* Loan Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Loan Name
            </label>
            <input
              type="text"
              value={loanData.loanName}
              onChange={(e) => handleChange("loanName", e.target.value)}
              placeholder="e.g. Student Loan"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700 transition"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Amount (₦)
            </label>
            <input
              type="number"
              value={loanData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              placeholder="e.g. 50000"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700 transition"
            />
          </div>

          {/* Loan Type */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Loan Type
            </label>
            <select
              name="loanType"
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

          {/* Interest Rate and Tenure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Interest Rate (%)
              </label>
              <input
                type="number"
                value={loanData.interestRate}
                onChange={(e) => handleChange("interestRate", e.target.value)}
                placeholder="e.g. 5"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tenure (months)
              </label>
              <input
                type="number"
                value={loanData.tenure}
                onChange={(e) => handleChange("tenure", e.target.value)}
                placeholder="e.g. 12"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700 transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Description
            </label>
            <textarea
              rows={4}
              value={loanData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Write a description about the loan..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-amber-700 transition resize-none"
            />
          </div>

          {/* Attach Document */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Attach Document
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={(e) => handleChange("document", e.target.files[0])}
              className="block w-full text-sm text-gray-500
               file:mr-4 file:py-2 file:px-4
               file:rounded-xl file:border-0
               file:text-sm file:font-semibold
               file:bg-amber-700 file:text-white
               hover:file:bg-amber-800 transition duration-200"
            />
            {loanData.document && (
              <p className="mt-1 text-sm text-green-700">
                Selected: {loanData.document.name}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-md transition duration-200"
            >
              Create Loan
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateLoan;
