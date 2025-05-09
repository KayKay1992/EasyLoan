import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../../Components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

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

  const [settingId, setSettingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsFetching(true);
        const res = await axiosInstance.get(API_PATHS.SETTING.GET_CURRENT_SETTING);

        if (res?.data?.settings) {
          const {
            _id,
            interestRate = "",
            loanTermOptions = [],
            maxLoanAmount = "",
            minLoanAmount = "",
            currency = "NGN",
            gracePeriodDays = "",
            latePaymentPenalty = "",
          } = res.data.settings;

          setSettings({
            interestRate: interestRate.toString(),
            loanTermOptions: loanTermOptions.join(", "),
            maxLoanAmount: maxLoanAmount.toString(),
            minLoanAmount: minLoanAmount.toString(),
            currency,
            gracePeriodDays: gracePeriodDays.toString(),
            latePaymentPenalty: latePaymentPenalty.toString(),
          });
          setSettingId(_id);
        }
      } catch (error) {
        console.log("No existing setting found. Starting fresh.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const {
      interestRate,
      loanTermOptions,
      maxLoanAmount,
      minLoanAmount,
      currency,
      gracePeriodDays,
      latePaymentPenalty,
    } = settings;

    if (
      !interestRate ||
      !loanTermOptions ||
      !maxLoanAmount ||
      !minLoanAmount ||
      !currency ||
      !gracePeriodDays ||
      !latePaymentPenalty
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    const termsArray = loanTermOptions
      .split(",")
      .map((term) => Number(term.trim()))
      .filter((n) => !isNaN(n) && n > 0);

    if (!termsArray.length) {
      toast.error("Loan terms must be a comma-separated list of positive numbers.");
      return;
    }

    const payload = {
      interestRate: parseFloat(interestRate),
      loanTermOptions: termsArray,
      maxLoanAmount: parseFloat(maxLoanAmount),
      minLoanAmount: parseFloat(minLoanAmount),
      currency,
      gracePeriodDays: parseInt(gracePeriodDays),
      latePaymentPenalty: parseFloat(latePaymentPenalty),
    };

    if (
      payload.interestRate <= 0 ||
      payload.maxLoanAmount <= 0 ||
      payload.minLoanAmount <= 0 ||
      payload.minLoanAmount >= payload.maxLoanAmount ||
      payload.gracePeriodDays < 0 ||
      payload.latePaymentPenalty < 0
    ) {
      toast.error("Please enter valid and logical values.");
      return;
    }

    try {
      setLoading(true);

      if (settingId) {
        await axiosInstance.put(API_PATHS.SETTING.UPDATE_SETTING, payload);
        toast.success("Settings updated successfully!");
      } else {
        const res = await axiosInstance.post(API_PATHS.SETTING.CREATE_SETTING, payload);
        toast.success("Settings created successfully!");
        if (res?.data?.settings?._id) {
          setSettingId(res.data.settings._id);
        }
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(error?.response?.data?.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeMenu="Settings">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-10 mt-10 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">
          {settingId ? "Update Settings" : "Create Settings"}
        </h2>

        {isFetching ? (
          <p>Loading settings...</p>
        ) : (
          <div className="space-y-6">
            <InputField
              label="Interest Rate (%)"
              value={settings.interestRate}
              onChange={(val) => handleChange("interestRate", val)}
              placeholder="e.g. 5"
              type="number"
            />
            <InputField
              label="Loan Terms (comma-separated months)"
              value={settings.loanTermOptions}
              onChange={(val) => handleChange("loanTermOptions", val)}
              placeholder="e.g. 6, 12, 24"
            />
            <InputField
              label="Maximum Loan Amount"
              value={settings.maxLoanAmount}
              onChange={(val) => handleChange("maxLoanAmount", val)}
              placeholder="e.g. 1000000"
              type="number"
            />
            <InputField
              label="Minimum Loan Amount"
              value={settings.minLoanAmount}
              onChange={(val) => handleChange("minLoanAmount", val)}
              placeholder="e.g. 10000"
              type="number"
            />
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
            <InputField
              label="Grace Period (Days)"
              value={settings.gracePeriodDays}
              onChange={(val) => handleChange("gracePeriodDays", val)}
              placeholder="e.g. 5"
              type="number"
            />
            <InputField
              label="Late Payment Penalty (%)"
              value={settings.latePaymentPenalty}
              onChange={(val) => handleChange("latePaymentPenalty", val)}
              placeholder="e.g. 2"
              type="number"
            />

            <div className="pt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`bg-amber-700 hover:bg-amber-800 text-white font-semibold px-6 py-3 rounded-xl transition ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading
                  ? "Processing..."
                  : settingId
                  ? "Update Settings"
                  : "Save Settings"}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-700 focus:outline-none"
    />
  </div>
);

export default CreateSetting;
