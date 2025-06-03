require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs").promises;
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHanlerMiddleware");

console.log("Starting server.js...");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MONGO_URI:", process.env.MONGO_URI ? "Set" : "Not set");

console.log("Importing route files...");
const authRoute = require("./routes/auth.route");
const userRoute = require("./routes/user.route");
const loanRoute = require("./routes/loan.route");
const repaymentRoute = require("./routes/repayment.route");
const transactionRoute = require("./routes/transaction.route");
const notificationRoute = require("./routes/notification.route");
const settingRoute = require("./routes/settings.route");
console.log("Route files imported successfully");

const app = express();

console.log("Setting up CORS...");
const allowedOrigins = [
  "https://easyloan.onrender.com",
  "https://easyloan-1.onrender.com",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("CORS Origin Check:", origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        console.error("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
console.log("✅ CORS setup complete");

app.use((req, res, next) => {
  console.log(
    `Request: ${req.method} ${req.url} from Origin: ${req.get("Origin") || "unknown"}`
  );
  next();
});
console.log("✅ Request logging enabled");

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});
console.log("✅ Health check route configured");

app.use(express.json());
console.log("✅ JSON parsing enabled");

console.log("Connecting to database...");
connectDB()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => {
    console.error("ERROR: Database connection failed:", err.message);
    process.exit(1);
  });

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
fs.mkdir(uploadsDir, { recursive: true })
  .then(() => console.log("✅ Uploads directory ensured"))
  .catch((err) => console.error("ERROR: Failed to create uploads directory:", err.message));

app.use("/uploads", express.static(uploadsDir));
console.log("✅ Uploads static route configured");

console.log("Installing routes...");
app.use("/api/auth", authRoute);
console.log("✔️ Installed auth routes");
app.use("/api/users", userRoute);
console.log("✔️ Installed user routes");
app.use("/api/loan", loanRoute);
console.log("✔️ Installed loan routes");
app.use("/api/transaction", transactionRoute);
console.log("✔️ Installed transaction routes");
app.use("/api/repayment", repaymentRoute);
console.log("✔️ Installed repayment routes");
app.use("/api/notification", notificationRoute);
console.log("✔️ Installed notification routes");
app.use("/api/setting", settingRoute);
console.log("✔️ Installed setting routes");
console.log("✅ Routes installed successfully");

app.use(errorHandler);
console.log("✅ Error handler installed");

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
console.log("🚀 Server starting...");

module.exports = app;