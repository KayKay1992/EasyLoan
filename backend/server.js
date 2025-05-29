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

app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST','PUT','DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

connectDB();
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/loan", loanRoute);
app.use("/api/transaction", transactionRoute);
app.use("/api/repayment", repaymentRoute);
app.use("/api/notification", notificationRoute);
app.use("/api/setting", settingRoute);
app.use(errorHandler);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from Express on Vercel!' });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app; // ONLY export the app
