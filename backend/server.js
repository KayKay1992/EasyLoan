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

const allowedOrigins = [
  'https://easyloan-1.onrender.com',
  
];

if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173');
}

app.use(cors({
  origin: allowedOrigins,
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

app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/loan', loanRoute);
app.use('/api/transaction', transactionRoute);
app.use('/api/repayment', repaymentRoute);
app.use('/api/notification', notificationRoute);
app.use('/api/setting', settingRoute);
app.use(errorHandler);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from Express on Render!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;