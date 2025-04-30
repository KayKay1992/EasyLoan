import {
    LuLayoutDashboard,
    LuUsers,
    LuClipboardCheck,
    LuSquarePlus,
    LuBanknote,
    LuArrowRightLeft,
    LuBell,
    LuSettings,
    LuLogOut
  } from 'react-icons/lu';
  
  export const ADMIN_SIDEBAR = [
    {
      id: "01",
      label: "Dashboard",
      icon: LuLayoutDashboard,
      path: "/admin/dashboard"
    },
    {
      id: "02",
      label: "Manage Loans",
      icon: LuClipboardCheck,
      path: "/admin/loans"
    },
    {
      id: "03",
      label: "Create Loan",
      icon: LuSquarePlus,
      path: "/admin/create-loan"
    },
    {
      id: "04",
      label: "Users",
      icon: LuUsers,
      path: "/admin/users"
    },
    {
      id: "05",
      label: "Transactions",
      icon: LuArrowRightLeft,
      path: "/admin/transactions"
    },
    {
      id: "06",
      label: "Repayments",
      icon: LuBanknote,
      path: "/admin/repayments"
    },
    {
      id: "07",
      label: "Notifications",
      icon: LuBell,
      path: "/admin/notifications"
    },
    {
      id: "08",
      label: "Settings",
      icon: LuSettings,
      path: "/admin/settings"
    },
    {
      id: "09",
      label: "Logout",
      icon: LuLogOut,
      path: "logout"
    }
  ];
  
  export const USER_SIDEBAR = [
    {
      id: "01",
      label: "Dashboard",
      icon: LuLayoutDashboard,
      path: "/user/dashboard"
    },
    {
      id: "02",
      label: "My Loans",
      icon: LuClipboardCheck,
      path: "/user/loans"
    },
    {
      id: "03",
      label: "Apply for Loan",
      icon: LuSquarePlus,
      path: "/user/apply-loan"
    },
    {
      id: "04",
      label: "Transactions",
      icon: LuArrowRightLeft,
      path: "/user/transactions"
    },
    {
      id: "05",
      label: "Repayments",
      icon: LuBanknote,
      path: "/user/repayments"
    },
    {
      id: "06",
      label: "Notifications",
      icon: LuBell,
      path: "/user/notifications"
    },
    {
      id: "07",
      label: "Logout",
      icon: LuLogOut,
      path: "logout"
    }
  ];
  export const LOAN_STATUS_DATA = [
    { label: "Pending", value: "Pending" },           // Loan is created but not yet reviewed
    { label: "Approved", value: "Approved" },         // Admin has approved the loan
    { label: "Active", value: "Active" },             // Funds disbursed; loan is in progress
    { label: "Completed", value: "Completed" },       // Loan is fully repaid
    { label: "Rejected", value: "Rejected" },         // Admin rejected the loan request
    { label: "Overdue", value: "Overdue" },           // Loan not repaid on time
    { label: "Cancelled", value: "Cancelled" }        // Loan was cancelled (either by user or admin)
  ];