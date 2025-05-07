import React, { useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../../Components/layouts/DashboardLayout";

const CreateSetting = () => {
  const [settings, setSettings] = useState({
    interestRate: "",
    loanTermOptions: "",
    maxLoanAmount: "",
    minLoanAmount: "",
    currency: "NGN",
    gracePeriodDays: "",
    latePaymentPenalty: "",
  });

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    console.log("Saving settings:", settings);
    toast.success("Settings saved successfully!");
    // You may send this to an API endpoint here
  };

  return (
    <DashboardLayout activeMenu="Settings">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-10 mt-10 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">EasyLoan Settings</h2>

        <div className="space-y-6">
          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
            <input
              type="number"
              value={settings.interestRate}
              onChange={(e) => handleChange("interestRate", e.target.value)}
              placeholder="e.g. 5"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-700 focus:outline-none"
            />
          </div>

          {/* Loan Term Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loan Terms (comma-separated months)
            </label>
            <input
              type="text"
              value={settings.loanTermOptions}
              onChange={(e) => handleChange("loanTermOptions", e.target.value)}
              placeholder="e.g. 6, 12, 24"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-700 focus:outline-none"
            />
          </div>

          {/* Max Loan Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Loan Amount</label>
            <input
              type="number"
              value={settings.maxLoanAmount}
              onChange={(e) => handleChange("maxLoanAmount", e.target.value)}
              placeholder="e.g. 1000000"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-700 focus:outline-none"
            />
          </div>

          {/* Min Loan Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Loan Amount</label>
            <input
              type="number"
              value={settings.minLoanAmount}
              onChange={(e) => handleChange("minLoanAmount", e.target.value)}
              placeholder="e.g. 10000"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-700 focus:outline-none"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 focus:ring-2 focus:ring-amber-700 focus:outline-none"
            >
              <option value="NGN">NGN (₦)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          {/* Grace Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grace Period (Days)</label>
            <input
              type="number"
              value={settings.gracePeriodDays}
              onChange={(e) => handleChange("gracePeriodDays", e.target.value)}
              placeholder="e.g. 5"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-700 focus:outline-none"
            />
          </div>

          {/* Late Payment Penalty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Late Payment Penalty (%)</label>
            <input
              type="number"
              value={settings.latePaymentPenalty}
              onChange={(e) => handleChange("latePaymentPenalty", e.target.value)}
              placeholder="e.g. 2"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-700 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              className="bg-amber-700 hover:bg-amber-800 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateSetting;
