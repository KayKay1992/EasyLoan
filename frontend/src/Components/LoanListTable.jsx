import React from "react";
import moment from "moment";

const LoanListTable = ({ tableData }) => {
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-500 border border-green-200";
      case "pending":
        return "bg-purple-100 text-purple-500 border border-purple-200";
      case "active":
        return "bg-cyan-100 text-cyan-500 border border-cyan-200";
      case "approved":
        return "bg-yellow-100 text-yellow-500 border border-yellow-200";
      case "defaulted":
        return "bg-amber-100 text-amber-500 border border-amber-200";
      case "rejected":
        return "bg-red-100 text-red-500 border border-red-200";
      default:
        return "bg-gray-100 text-gray-500 border border-gray-200";
    }
  };

  const getLoanTypeBadgeColor = (loanType) => {
    switch (loanType) {
      case "personal":
        return "bg-red-100 text-red-500 border border-red-200";
      case "business":
        return "bg-orange-100 text-orange-500 border border-orange-200";
      case "student":
        return "bg-green-100 text-green-500 border border-green-200";
      case "mortgage":
        return "bg-violet-100 text-violet-500 border border-violet-200";
      case "car loan":
        return "bg-blue-100 text-blue-500 border border-blue-200";
      case "quickie loan":
        return "bg-purple-100 text-purple-500 border border-purple-200";
      default:
        return "bg-gray-100 text-gray-500 border border-gray-200";
    }
  };

  return (
    <div className="overflow-x-auto p-0 rounded-lg mt-3">
      <table className="min-w-full">
        <thead>
          <tr className="text-left">
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">User Id</th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">Amount</th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">Status</th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">Loan Type</th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px] hidden md:table-cell">Created On</th>
          </tr>
        </thead>
        <tbody>
          {(!tableData || tableData.length === 0) ? (
            <tr>
              <td colSpan="5" className="text-center py-6 text-gray-500">
                No recent loan found.
              </td>
            </tr>
          ) : (
            tableData.map((loan) => (
              <tr key={loan._id} className="border-t border-gray-200">
                <td className="py-4 px-4 text-gray-700 text-[13px] line-clamp-1 overflow-hidden">
                  {loan.user}
                </td>
                <td className="py-4 px-4 text-gray-700 text-[13px]">
                  ₦{Number(loan.amount).toLocaleString()}
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 text-xs rounded inline-block ${getStatusBadgeColor(loan.status)}`}>
                    {loan.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 text-xs rounded inline-block ${getLoanTypeBadgeColor(loan.loanType)}`}>
                    {loan.loanType}
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-700 text-[13px] text-nowrap hidden md:table-cell">
                  {loan.createdAt ? moment(loan.createdAt).format("Do MMM YYYY") : "N/A"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LoanListTable;
