require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const authRoute = require('./routes/auth.route');
const userRoute = require('./routes/user.route');
const loanRoute = require('./routes/loan.route');
const repaymentRoute = require('./routes/repayment.route');
const transactionRoute = require('./routes/transaction.route');
const notificationRoute = require('./routes/notification.route');
const settingRoute = require('./routes/settings.route');
const errorHandler = require('./middleware/errorHanlerMiddleware');

const app = express();

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');

// Enhanced CORS configuration
const allowedOrigins = [
  'https://easyloan-1.onrender.com',
  'https://easyloan.onrender.com', // Add your backend domain if different
'http://localhost:5173' // Optional: Use environment variable
];

// Development origins
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173');
}

// Dynamic CORS origin checking
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin && process.env.NODE_ENV !== 'production') {
      // Allow requests with no origin (like mobile apps or Postman)
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());

// Connect to DB
connectDB().then(() => {
  console.log('Database connected successfully');
}).catch(err => {
  console.error('Database connection error:', err.message);
  process.exit(1);
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request for ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/loan', loanRoute);
app.use('/api/transaction', transactionRoute);
app.use('/api/repayment', repaymentRoute);
app.use('/api/notification', notificationRoute);
app.use('/api/setting', settingRoute);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    frontend: allowedOrigins,
    environment: process.env.NODE_ENV
  });
});

// React Frontend Handling (Production Only)
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  
  // Verify frontend build exists
  try {
    const files = fs.readdirSync(frontendPath);
    console.log('Frontend build files:', files);
  } catch (err) {
    console.error('Frontend build not found at:', frontendPath);
    console.error('Please build your React app first (npm run build)');
    process.exit(1);
  }

  // Serve static files from React build
  app.use(express.static(frontendPath));

  // Handle React routing - exclude API routes
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;