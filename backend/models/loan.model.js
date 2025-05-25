const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  amount: {
    type: Number,
  },
  loanType: {
    type: String,
    enum: [
      "personal",
      "business",
      "student",
      "mortgage",
      "car loan",
      "quickie loan",
    ],
  },
  interestRate: {
    type: Number,
  },
  termMonths: {
    type: Number,
  },
  monthlyPayment: {
    type: Number,
  },
  totalRepayable: {
    type: Number,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "approved",
      "rejected",
      "active",
      "completed",
      "defaulted",
    ],
    default: "pending",
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  documents: [
    {
      type: String, // Path to uploaded file
    },
  ],
  bankName: {
    type: String,
  },
  accountName: {
    type: String,
  },
  accountNumber: {
    type: String,
  },
  BVN: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  isOffer: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  defaultedAt: {
    type: Date,
  },
  repaymentBalance: {
    type: Number,
    default: 0,
  },
  loanId: {
    type: String, // Added to match controller
  },
});

module.exports = mongoose.model("Loan", loanSchema);
