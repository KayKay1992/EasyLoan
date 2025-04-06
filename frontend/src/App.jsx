import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Pages/UserPages/Home'
import Login from './Pages/AuthPages/Login'
import SignUp from './Pages/AuthPages/SignUp'
import PrivateRoute from './Routes/PrivateRoute'
import UserDashboard from './Pages/UserPages/UserDashboard'
import LoanDetails from './Pages/UserPages/LoanDetails'
import LoanCalculator from './Pages/UserPages/LoanCalculator'
import ApplyLoan from './Pages/UserPages/ApplyLoan'
import AdminDashboard from './Pages/AdminPages/AdminDashboard'
import ManageLoans from './Pages/AdminPages/ManageLoans'
import CreateLoan from './Pages/AdminPages/CreateLoan'
import ManageUsers from './Pages/AdminPages/ManageUsers'

const App = () => {
  return (
   <div>
     <Router>
        <Routes>
          {/* Auth routes go here */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* User routes go here */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/loan-details/:id" element={<LoanDetails />} />
            <Route path="/user/loan-calculator" element={<LoanCalculator />} />
            <Route path="/user/apply-loan" element={<ApplyLoan/>} />
          </Route>

          {/* Admin routes go here */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/manage-loan" element={<ManageLoans />} />
            <Route path="/admin/create-loan" element={<CreateLoan/>} />
            <Route path="/admin/users" element={<ManageUsers/>} />
          </Route>
        </Routes>
      </Router>
  
   </div>
  )
}

export default App