import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../Components/layouts/DashboardLayout";
import toast from "react-hot-toast";
import { API_PATHS, BASE_URL } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const RepaymentsPage = () => {
  // Navigation hook for programmatic routing
  const navigate = useNavigate();

  // State management for repayments data and UI
  const [repayments, setRepayments] = useState([]); // Stores repayment records
  const [loading, setLoading] = useState(false); // Loading state for initial load
  const [isRefreshing, setIsRefreshing] = useState(false); // Loading state for refresh
  const [searchTerm, setSearchTerm] = useState(""); // Search input value
  const [statusFilter, setStatusFilter] = useState("all"); // Filter by repayment status
  const [loanTypeFilter, setLoanTypeFilter] = useState("all"); // Filter by loan type
  const [selectedRepayment, setSelectedRepayment] = useState(null); // Currently selected repayment for details view
  const [openDetailDialog, setOpenDetailDialog] = useState(false); // Controls detail modal visibility
  const [page, setPage] = useState(0); // Current pagination page
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page in table

  // Memoized currency formatter for Naira (NGN)
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(Number(amount) || 0);
  }, []);

  // Memoized date formatter using date-fns
  const formatDate = useCallback((dateString) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "N/A";
    }
  }, []);

  /**
   * Fetches repayment data from the API
   * Handles loading states and error notifications
   */
  const fetchRepayments = useCallback(async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const response = await axiosInstance.get(
        API_PATHS.REPAYMENT.GET_ALL_REPAYMENTS
      );
      const data = response.data.repayments || [];
      setRepayments(data);
    } catch (error) {
      console.error("Error fetching repayments:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch repayments"
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Fetch repayments on component mount
  useEffect(() => {
    fetchRepayments();
  }, [fetchRepayments]);

  /**
   * Memoized filtered repayments based on:
   * - Search term (name, email, reference ID)
   * - Status filter
   * - Loan type filter
   */
  const filteredRepayments = useMemo(() => {
    return repayments.filter((repayment) => {
      const matchesSearch =
        (repayment.user?.name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (repayment.user?.email?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (repayment.referenceId?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        );

      const matchesStatus =
        statusFilter === "all" || repayment.status === statusFilter;
      const matchesLoanType =
        loanTypeFilter === "all" || repayment.loan?.type === loanTypeFilter;

      return matchesSearch && matchesStatus && matchesLoanType;
    });
  }, [repayments, searchTerm, statusFilter, loanTypeFilter]);

  // Paginated data for table display
  const paginatedRepayments = useMemo(() => {
    return filteredRepayments.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredRepayments, page, rowsPerPage]);

  // Debug table rendering (for development purposes)
  useEffect(() => {
    const table = document.querySelector("table");
    const actions = document.querySelectorAll(".sticky.right-0");
    console.log(
      "Table rendered:",
      !!table,
      "Columns:",
      table?.querySelectorAll("th").length
    );
    console.log(
      "Actions columns:",
      actions.length,
      "Width:",
      actions[0]?.offsetWidth
    );
  }, [paginatedRepayments]);

  // Pagination handlers
  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  // Handles row click to view repayment details
  const handleRowClick = useCallback((repayment) => {
    setSelectedRepayment(repayment);
    setOpenDetailDialog(true);
  }, []);

  // Resets all filters to default values
  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setLoanTypeFilter("all");
    setPage(0);
  }, []);

  /**
   * StatusChip component - Displays repayment status with colored badge
   * @param {string} status - Repayment status (completed, pending, failed)
   */
  const StatusChip = useCallback(({ status }) => {
    // Determine badge colors based on status
    let bgColor, textColor;
    switch (status) {
      case "completed":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        break;
      case "pending":
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        break;
      case "failed":
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        break;
      default:
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
    }

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
      >
        {(status || "unknown").charAt(0).toUpperCase() +
          (status || "unknown").slice(1)}
      </span>
    );
  }, []);

  /**
   * LoanTypeChip component - Displays loan type with colored badge
   * @param {string} type - Loan type (personal, business, etc.)
   */
  const LoanTypeChip = useCallback(({ type }) => {
    // Determine badge colors based on loan type
    let bgColor, textColor;
    switch (type) {
      case "personal":
        bgColor = "bg-purple-100";
        textColor = "text-purple-800";
        break;
      case "business":
        bgColor = "bg-indigo-100";
        textColor = "text-indigo-800";
        break;
      case "student":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        break;
      case "mortgage":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        break;
      case "car loan":
        bgColor = "bg-orange-100";
        textColor = "text-orange-800";
        break;
      case "quickie loan":
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        break;
      default:
        bgColor = "bg-gray-100";
        textColor = "text-gray-800";
    }

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
      >
        {(type || "unknown").charAt(0).toUpperCase() +
          (type || "unknown").slice(1)}
      </span>
    );
  }, []);

  // Animation variants for Framer Motion animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  /**
   * Exports repayment details as PDF using jsPDF
   * @param {object} repayment - The repayment record to export
   */
  const exportRepaymentAsPDF = useCallback(
    (repayment) => {
      const doc = new jsPDF();
      const timestamp = format(new Date(), "yyyyMMdd");
      let yPos = 20;

      // PDF header
      doc.setFontSize(16);
      doc.text("Repayment Details", 14, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.text(`Reference: ${repayment.referenceId || "N/A"}`, 14, yPos);
      yPos += 6;
      doc.text(
        `Generated on: ${format(new Date(), "MMM d, yyyy HH:mm")}`,
        14,
        yPos
      );
      yPos += 10;

      // Transaction information section
      doc.setFontSize(12);
      doc.text("Transaction Information", 14, yPos);
      yPos += 6;
      autoTable(doc, {
        startY: yPos,
        head: [["Field", "Value"]],
        body: [
          ["Reference ID", repayment.referenceId || "N/A"],
          [
            "Status",
            (repayment.status || "unknown").charAt(0).toUpperCase() +
              (repayment.status || "unknown").slice(1),
          ],
        ],
        theme: "striped",
        styles: { fontSize: 8 },
      });
      yPos = doc.lastAutoTable.finalY + 10;

      // User information section
      doc.setFontSize(12);
      doc.text("User Information", 14, yPos);
      yPos += 6;
      autoTable(doc, {
        startY: yPos,
        head: [["Field", "Value"]],
        body: [
          ["Name", repayment.user?.name || "Unknown"],
          ["Email", repayment.user?.email || "N/A"],
          ["Phone", repayment.user?.phone || "N/A"],
        ],
        theme: "striped",
        styles: { fontSize: 8 },
      });
      yPos = doc.lastAutoTable.finalY + 10;

      // Loan information section
      doc.setFontSize(12);
      doc.text("Loan Information", 14, yPos);
      yPos += 6;
      autoTable(doc, {
        startY: yPos,
        head: [["Field", "Value"]],
        body: [
          [
            "Type",
            (repayment.loan?.type || "unknown").charAt(0).toUpperCase() +
              (repayment.loan?.type || "unknown").slice(1),
          ],
          ["Amount", formatCurrency(repayment.loan?.amount)],
          [
            "Status",
            (repayment.loan?.status || "N/A").charAt(0).toUpperCase() +
              (repayment.loan?.status || "N/A").slice(1),
          ],
        ],
        theme: "striped",
        styles: { fontSize: 8 },
      });
      yPos = doc.lastAutoTable.finalY + 10;

      // Payment details section
      doc.setFontSize(12);
      doc.text("Payment Details", 14, yPos);
      yPos += 6;
      autoTable(doc, {
        startY: yPos,
        head: [["Field", "Value"]],
        body: [
          ["Last Payment", formatCurrency(repayment.lastPayment)],
          [
            "Method",
            (repayment.paymentMethod || "N/A").charAt(0).toUpperCase() +
              (repayment.paymentMethod || "N/A").slice(1),
          ],
          ["Payment Date", formatDate(repayment.paymentDate)],
          [
            "Due Date",
            repayment.dueDate ? formatDate(repayment.dueDate) : "N/A",
          ],
        ],
        theme: "striped",
        styles: { fontSize: 8 },
      });
      yPos = doc.lastAutoTable.finalY + 10;

      // Payment summary section
      doc.setFontSize(12);
      doc.text("Payment Summary", 14, yPos);
      yPos += 6;
      autoTable(doc, {
        startY: yPos,
        head: [["Field", "Value"]],
        body: [
          ["Last Payment", formatCurrency(repayment.lastPayment)],
          ["Total Paid", formatCurrency(repayment.totalPaidSoFar)],
          ["Remaining Balance", formatCurrency(repayment.repaymentBalance)],
        ],
        theme: "striped",
        styles: { fontSize: 8 },
      });
      yPos = doc.lastAutoTable.finalY + 10;

      // Payment evidence link if available
      if (repayment.evidence) {
        doc.setFontSize(12);
        doc.text("Payment Evidence", 14, yPos);
        yPos += 6;
        doc.setFontSize(10);
        doc.textWithLink("View Evidence", 14, yPos, {
          url: repayment.evidence,
        });
      }

      // Save the PDF
      doc.save(
        `repayment_${repayment.referenceId || "unknown"}_${timestamp}.pdf`
      );
      toast.success("Repayment details exported as PDF");
    },
    [formatCurrency, formatDate]
  );

  /**
   * EmptyState component - Displayed when no repayments match filters
   */
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
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
      <h3 className="mt-2 text-sm font-medium text-gray-900">No repayments</h3>
      <p className="mt-1 text-sm text-gray-500">
        {searchTerm || statusFilter !== "all" || loanTypeFilter !== "all"
          ? "No repayments match your search criteria."
          : "There are currently no repayments to display."}
      </p>
      <div className="mt-6">
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
          Reset filters
        </button>
      </div>
    </motion.div>
  );

  return (
    <DashboardLayout activeMenu="Repayments">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-visible">
        {/* Main content container with animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 mb-6"
        >
          {/* Header section with title and refresh button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Repayment Management
            </h2>
            <div className="mt-4 md:mt-0">
              <button
                onClick={fetchRepayments}
                disabled={isRefreshing}
                className={`bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition flex items-center ${
                  isRefreshing ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isRefreshing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search and Filters section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="col-span-1 md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  placeholder="Search repayments..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Status filter dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              {/* Loan type filter dropdown */}
              <select
                value={loanTypeFilter}
                onChange={(e) => setLoanTypeFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              >
                <option value="all">All Loan Types</option>
                <option value="personal">Personal</option>
                <option value="business">Business</option>
                <option value="student">Student</option>
                <option value="mortgage">Mortgage</option>
                <option value="car loan">Car Loan</option>
                <option value="quickie loan">Quickie Loan</option>
              </select>
            </div>
          </div>

          {/* Repayments Display Section */}
          {loading && !isRefreshing ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredRepayments.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  {/* Desktop Table View (hidden on mobile) */}
                  <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 mr-4">
                    <table className="min-w-[1000px] divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                          >
                            User
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                          >
                            Loan Info
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]"
                          >
                            Last Payment
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]"
                          >
                            Total Paid
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]"
                          >
                            Balance
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                          >
                            Payment Date
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px] sticky right-0 bg-gray-50"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedRepayments.map((repayment) => (
                          <motion.tr
                            key={repayment._id}
                            variants={itemVariants}
                            className="hover:bg-gray-50"
                          >
                            {/* User column */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-medium">
                                  {(repayment.user?.name || "U").charAt(0)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {repayment.user?.name || "Unknown"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {repayment.user?.email || "N/A"}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Loan info column */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <LoanTypeChip type={repayment.loan?.type} />
                                <div className="text-sm text-gray-900 mt-1">
                                  {formatCurrency(repayment.loan?.amount)}
                                </div>
                              </div>
                            </td>

                            {/* Last payment column */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {formatCurrency(repayment.lastPayment)}
                              <div className="text-xs text-gray-500 capitalize">
                                {repayment.paymentMethod || "N/A"}
                              </div>
                            </td>

                            {/* Total paid column */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {formatCurrency(repayment.totalPaidSoFar)}
                            </td>

                            {/* Balance column */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {formatCurrency(repayment.repaymentBalance)}
                            </td>

                            {/* Payment date column */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatDate(repayment.paymentDate)}
                              </div>
                              {repayment.dueDate && (
                                <div className="text-xs text-gray-500">
                                  Due: {formatDate(repayment.dueDate)}
                                </div>
                              )}
                            </td>

                            {/* Actions column (sticky on the right) */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium visible sticky right-0 bg-white">
                              <button
                                onClick={() => handleRowClick(repayment)}
                                className="text-amber-600 hover:text-amber-900"
                              >
                                View
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View (hidden on desktop) */}
                  <div className="md:hidden">
                    {paginatedRepayments.map((repayment) => (
                      <motion.div
                        key={repayment._id}
                        variants={itemVariants}
                        className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-medium">
                              {(repayment.user?.name || "U").charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {repayment.user?.name || "Unknown"}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRowClick(repayment)}
                            className="text-amber-600 hover:text-amber-900 text-sm font-medium"
                          >
                            View
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between mt-4 px-4">
                    {/* Mobile pagination */}
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setPage((p) => Math.max(p - 1, 0))}
                        disabled={page === 0}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={
                          page >=
                          Math.ceil(filteredRepayments.length / rowsPerPage) - 1
                        }
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>

                    {/* Desktop pagination */}
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{" "}
                          <span className="font-medium">
                            {page * rowsPerPage + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(
                              (page + 1) * rowsPerPage,
                              filteredRepayments.length
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {filteredRepayments.length}
                          </span>{" "}
                          results
                        </p>
                      </div>
                      <div>
                        <nav
                          className="relative z-10 inline-flex rounded-md shadow-sm -space-x-px"
                          aria-label="Pagination"
                        >
                          {/* Rows per page selector */}
                          <select
                            value={rowsPerPage}
                            onChange={handleChangeRowsPerPage}
                            className="mr-4 border-gray-300 rounded text-sm"
                          >
                            {[5, 10, 25, 50, 100].map((size) => (
                              <option key={size} value={size}>
                                Show {size}
                              </option>
                            ))}
                          </select>

                          {/* Previous page button */}
                          <button
                            onClick={() => handleChangePage(null, page - 1)}
                            disabled={page === 0}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Previous</span>
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>

                          {/* Page number buttons */}
                          {Array.from(
                            {
                              length: Math.ceil(
                                filteredRepayments.length / rowsPerPage
                              ),
                            },
                            (_, i) => (
                              <button
                                key={i}
                                onClick={() => handleChangePage(null, i)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  page === i
                                    ? "z-10 bg-amber-50 border-amber-500 text-amber-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {i + 1}
                              </button>
                            )
                          )}

                          {/* Next page button */}
                          <button
                            onClick={() => handleChangePage(null, page + 1)}
                            disabled={
                              page >=
                              Math.ceil(
                                filteredRepayments.length / rowsPerPage
                              ) -
                                1
                            }
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Next</span>
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Repayment Detail Dialog (Modal) */}
        <AnimatePresence>
          {openDetailDialog && selectedRepayment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
                {/* Modal backdrop */}
                <div
                  className="fixed inset-0 bg-gray-500 bg-opacity-50 z-40"
                  onClick={() => setOpenDetailDialog(false)}
                  aria-hidden="true"
                ></div>

                {/* Modal content */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative inline-block align-bottom bg-white bg-opacity-100 rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full z-50 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                >
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Repayment Details
                        </h3>
                        <button
                          type="button"
                          className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                          onClick={() => {
                            console.log("Close button clicked");
                            setOpenDetailDialog(false);
                          }}
                        >
                          <span className="sr-only">Close</span>
                          <svg
                            className="h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">
                              Transaction Reference
                            </h4>
                            <p className="text-sm text-gray-900">
                              {selectedRepayment.referenceId || "N/A"}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">
                              Payment Status
                            </h4>
                            <StatusChip status={selectedRepayment.status} />
                          </div>
                        </div>

                        <div className="mt-6 border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">
                            User Information
                          </h4>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-medium">
                              {(selectedRepayment.user?.name || "U").charAt(0)}
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">
                                {selectedRepayment.user?.name || "Unknown"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {selectedRepayment.user?.email || "N/A"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {selectedRepayment.user?.phone || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">
                            Loan Information
                          </h4>
                          <div className="flex items-center">
                            <LoanTypeChip type={selectedRepayment.loan?.type} />
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">
                                Amount:{" "}
                                {formatCurrency(selectedRepayment.loan?.amount)}
                              </p>
                              <p className="text-sm text-gray-500">
                                Status:{" "}
                                <span className="capitalize">
                                  {selectedRepayment.loan?.status || "N/A"}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">
                              Payment Details
                            </h4>
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(selectedRepayment.lastPayment)}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">
                              Method: {selectedRepayment.paymentMethod || "N/A"}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">
                              Payment Date
                            </h4>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(selectedRepayment.paymentDate)}
                            </p>
                            {selectedRepayment.dueDate && (
                              <p className="text-sm text-gray-500">
                                Due: {formatDate(selectedRepayment.dueDate)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">
                            Payment Summary
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Last Payment
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(selectedRepayment.lastPayment)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Total Paid
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(
                                  selectedRepayment.totalPaidSoFar
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Remaining Balance
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(
                                  selectedRepayment.repaymentBalance
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {selectedRepayment.evidence && (
                          <div className="mt-6 border-t border-gray-200 pt-4">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">
                              Payment Evidence
                            </h4>
                            <button
                              onClick={() => {
                                const evidencePath =
                                  selectedRepayment.evidence.startsWith("/")
                                    ? selectedRepayment.evidence
                                    : `/${selectedRepayment.evidence}`;
                                const evidenceUrl =
                                  selectedRepayment.evidence.startsWith("http")
                                    ? selectedRepayment.evidence
                                    : `${BASE_URL}${evidencePath}`;
                                console.log(
                                  "Opening evidence URL:",
                                  evidenceUrl
                                );
                                window.open(evidenceUrl, "_blank");
                              }}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              View Evidence
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => exportRepaymentAsPDF(selectedRepayment)}
                    >
                      Export as PDF
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => {
                        console.log("Close button clicked");
                        setOpenDetailDialog(false);
                      }}
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default RepaymentsPage;
