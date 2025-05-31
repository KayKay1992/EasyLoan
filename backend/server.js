require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
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

const allowedOrigins = ['https://easyloan.onrender.com', 'https://easyloan-1.onrender.com'];
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173');
}

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url} from Origin: ${req.get('Origin') || 'undefined'}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check hit from', req.get('Origin') || 'undefined');
  res.status(200).send('OK');
});

// Debug endpoint to list assets
app.get('/debug/files', (req, res) => {
  const fs = require('fs');
  const dir = path.join(__dirname, '../frontend/dist/assets');
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading assets directory: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    res.json({ files });
  });
});

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    console.log('CORS check for origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// Connect to DB
connectDB().then(() => {
  console.log('Database connected successfully');
}).catch(err => {
  console.error('Database connection error:', err.message);
  process.exit(1);
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

// Production static file serving
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(staticPath, {
    setHeaders: (res, path) => {
      console.log(`Serving static file: ${path}`);
    },
    fallthrough: true,
  }));
  app.use((req, res, next) => {
    if (req.url.startsWith('/assets')) {
      console.log(`Static file not found: ${req.url}`);
    }
    next();
  })
  app.get(/^(?!\/api).*/, (req, res) => {
    console.log('Serving React app for', req.url);
    res.sendFile(path.join(staticPath, 'index.html'), err => {
      if (err) {
        console.error(`Error serving index.html: ${err.message}`);
        res.status(500).send('Error serving page');
      }
    });
  });
}

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;