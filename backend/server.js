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

// Middleware to handle cors
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST','PUT','DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

//ConnectDatabase
connectDB()

//Middleware
app.use(express.json());

//for static files
app.use('/uploads', express.static('uploads'));


// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/loan", loanRoute);
app.use("/api/transaction", transactionRoute)
app.use("/api/repayment", repaymentRoute);
app.use("/api/notification", notificationRoute);
app.use("/api/setting", settingRoute);

// Global error handler (this should be added at the end, after all routes)
app.use(errorHandler);


//start server

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});