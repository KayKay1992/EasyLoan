import React, { useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom'
// import Home from './Pages/UserPages/Home'
import Login from './Pages/AuthPages/Login'
import SignUp from './Pages/AuthPages/SignUp'
import PrivateRoute from './Routes/PrivateRoute'
import UserDashboard from './Pages/UserPages/UserDashboard'
import LoanDetails from './Pages/AdminPages/LoanDetails'
import LoanCalculator from './Pages/UserPages/LoanCalculator'
import ApplyLoan from './Pages/UserPages/ApplyLoan'
import AdminDashboard from './Pages/AdminPages/AdminDashboard'
import ManageLoans from './Pages/AdminPages/ManageLoans'
import CreateLoan from './Pages/AdminPages/CreateLoan'
import ManageUsers from './Pages/AdminPages/ManageUsers'
import UserProvider, { UserContext } from './context/userContext'
import CreateTransactions from './Pages/AdminPages/CreateTransactions'
import { Toaster } from 'react-hot-toast'
import CreateNotification from './Pages/AdminPages/CreateNotifications'
import CreateSetting from './Pages/AdminPages/CreateSetting'
import RepaymentsTable from './Pages/AdminPages/Repayment'


const App = () => {
  return (
    <UserProvider>
       <Toaster position="top-right" />
   <div>
     <Router>
        <Routes>
          {/* Auth routes go here */}
          {/* <Route path="/" element={<Home />} /> */}
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
            <Route path="/admin/loans" element={<ManageLoans />} />
             <Route path="/admin/loan-details/:id" element={<LoanDetails />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/create-loan" element={<CreateLoan/>} />
            <Route path="/admin/repayments" element={<RepaymentsTable/>} />
            <Route path="/admin/users" element={<ManageUsers/>} />
            <Route path="/admin/transactions" element={<CreateTransactions/>} />
            <Route path="/admin/notifications" element={<CreateNotification/>} />
            <Route path="/admin/settings" element={<CreateSetting/>} />
          </Route>
           {/*DEFAULT ROUTE */}
           <Route path='/' element={<Root/>}/>
        </Routes>
      </Router>
  
   </div>
   </UserProvider>
  )
}

export default App

//Define the root
const Root = () => {
  const {user, loading} = useContext(UserContext)

  if(loading) return <Outlet/>

  if(!user){
    return <Navigate to='/login'/>
  }
  return user.role === 'admin' ? <Navigate to='/admin/dashboard' /> : <Navigate to="/user/dashboard"/>
}
