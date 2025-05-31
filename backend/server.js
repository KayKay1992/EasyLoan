require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

console.log("Starting server.js...");

// Log environment
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
const errorHandler = require("./middleware/errorHanlerMiddleware");
console.log("Route files imported successfully");

const app = express();

console.log("Setting up CORS...");
// Define allowed origins
const allowedOrigins = [
  "https://easyloan.onrender.com",
  "https://easyloan-1.onrender.com",
  "http://localhost:5173",
];

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("CORS Origin Check:", origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
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
console.log("CORS setup complete");

// Handle preflight OPTIONS requests
app.use(cors()); // Already handles OPTIONS preflight
console.log("Preflight OPTIONS handler set");

// Log incoming requests
app.use((req, res, next) => {
  console.log(
    `Request: ${req.method} ${req.url} from Origin: ${
      req.get("Origin") || "undefined"
    }`
  );
  next();
});
console.log("Request logging middleware set");

// Debug: CORS test route
app.options("/cors-test", cors());
app.post("/cors-test", cors(), (req, res) => {
  res.json({ message: "CORS is working!" });
});
console.log("CORS test route set");

// Health check
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});
console.log("Health check route set");

// Debug: List frontend files
app.get("/debug/files", (req, res) => {
  const fs = require("fs");
  const dir = path.join(__dirname, "../frontend/dist/assets");
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading assets directory: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    res.json({ files });
  });
});
console.log("Debug files route set");

// Parse JSON
app.use(express.json());
console.log("JSON parser set");

// Connect to DB
console.log("Connecting to database...");
connectDB()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => {
    console.error("Database connection error:", err.message);
    process.exit(1);
  });

// Routes
console.log("Registering routes...");
try {
  app.use("/api/auth", authRoute);
  console.log("Registered auth routes");
  app.use("/api/users", userRoute);
  console.log("Registered user routes");
  app.use("/api/loan", loanRoute);
  console.log("Registered loan routes");
  app.use("/api/transaction", transactionRoute);
  console.log("Registered transaction routes");
  app.use("/api/repayment", repaymentRoute);
  console.log("Registered repayment routes");
  app.use("/api/notification", notificationRoute);
  console.log("Registered notification routes");
  app.use("/api/setting", settingRoute);
  console.log("Registered setting routes");
} catch (err) {
  console.error("Error registering routes:", err.message);
  process.exit(1);
}
console.log("Routes registered successfully");

// Uploads
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));
console.log("Uploads static route set");

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "../frontend/dist");
  console.log("Setting up static file serving:", staticPath);
  app.use(
    express.static(staticPath, {
      setHeaders: (res, filePath) => {
        console.log(`Serving static: ${filePath}`);
      },
      fallthrough: true,
    })
  );

  app.use((req, res, next) => {
    if (req.url.startsWith("/assets")) {
      console.log(`Static file not found: ${req.url}`);
    }
    next();
  });

  app.get(/^(?!\/api).*/, (req, res) => {
    console.log("Serving React App for:", req.url);
    res.sendFile(path.join(staticPath, "index.html"), (err) => {
      if (err) {
        console.error("Error sending index.html:", err.message);
        res.status(500).send("Error serving page");
      }
    });
  });
}
console.log("Static file serving setup complete");

// Global error handler
app.use(errorHandler);
console.log("Error handler set");

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
console.log("Server starting...");

module.exports = app;