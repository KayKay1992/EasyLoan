export const BASE_URL = "http://localhost:3000";

//utils /apiPaths.js
export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register", //Register a new user (admin or user)
    LOGIN: "/api/auth/login", //login a user and return a jwt token
    ME: '/api/auth/me', //Get currently logged-in user info
    GET_PROFILE: "/api/auth/profile", //get logged in user details.
    UPDATE_USER_PROFILE: '/api/auth/profile' //to update a user profile
  },

  USERS: {
    GET_ALL_USERS: "/api/users", //get all users admin only
    GET_USER_BY_ID: (userId) => `/api/users/${userId}`,
    // CREATE_USER: "api/users", //admin create a new user
    // UPDATE_USER: (userId) => `api/users/${userId}`, //update user details
    DELETE_USER: (userId) => `/api/users/${userId}`, //delete user
  },

  LOANS: {
    GET_DASHBOARD_DATA: "/api/loan/dashboard-data", //get dashboard data
    GET_USER_DASHBOARD_DATA: "/api/loan/user-dashboard-data", //Get user dashboard.
    GET_ALL_LOANS: "/api/loan", //admin and assigned user to get all tasks
    GET_LOAN_BY_ID: (loanId) => `/api/loan/${loanId}`, //get task by id
    CREATE_LOAN: "/api/loans", //create task admin
    UPDATE_LOAN: (loanId) => `/api/loan/${loanId}`, //update task details
    DELETE_LOAN: (loanId) => `/api/loan/${loanId}`, //admin to delete a task
    UPDATE_LOAN_STATUS: (loanId) => `/api/loan/${loanId}/status`,
    APPLY_LOAN: `/api/loan/apply`, //apply loan
  },

  TRANSACTION: {
    CREATE_TRANSACTION: '/api/transaction', //to create transaction admin
    GET_ALL_TRANSACTIONS: '/api/transaction' ,//admin getting all transaction.
    GET_TRANSACTION_BY_ID:(transactionId) =>`/api/transaction/${transactionId}`, 
    UPDATE_TRANSACTION: (transactionId) => `/api/transaction/${transactionId}`,
    DELETE_TRANSACTION:(transactionId) => `/api/transaction/${transactionId}`,
    GET_TRANSACTION_BY_USER:(userId) => `/api/transaction/user/${userId}`,
    GET_TRANSACTION_BY_LOAN_ID:(loanId) => `/api/transaction/loan/${loanId}`
  },

  REPAYMENT: {
    CREATE_REPAYMENT: '/api/repayment',
    GET_ALL_REPAYMENTS: '/api/repayment',
    GET_REPAYMENT_BY_ID: (repaymentId) => `/api/repayment/${repaymentId}`,
    GET_REPAYMENT_BY_USER:(userId) => `/api/repayment/user/${userId}`,
    GET_REPAYMENT_BY_LOAN_ID: (loanId) => `/api/repayment/loan/${loanId}`,
    UPDATE_REPAYMENT: (repaymentId) => `/api/repayment/${repaymentId}`,
    DELETE_REPAYMENT: (repaymentId) => `/api/repayment/${repaymentId}`,
  },

  NOTIFICATION: {
    GET_ALL_NOTIFICATION: '/api/notification',
    CREATE_NOTIFICATION: '/api/notification',
    MARK_NOTIFICATION_AS_READ: (notificationId) => `/api/notification/read/${notificationId}`,
    GET_UNREAD_NOTIFICATION: `/api/notification/unread`,
    DELETE_NOTIFICATION: (notificationId) => `/api/notification/${notificationId}`,
    GET_NOTIFICATION_BY_ID: (notificationId) => `/api/notification/${notificationId}`
  },
  SETTING: {
    GET_CURRENT_SETTING: '/api/setting',
    CREATE_SETTING: '/api/setting',
    UPDATE_SETTING: '/api/setting'
  },

//   REPORTS: {
//     EXPORT_TASKS: "/api/reports/export/tasks", //download all tasks as excel file
//     EXPORT_USERS: "/api/reports/export/users", //download user-task report
//   },
  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image",
  },

};