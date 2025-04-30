import React, { useContext } from 'react'
import { UserContext } from '../../context/userContext'
import { useUserAuth } from '../../hooks/useUserAuth'
import DashboardLayout from '../../Components/layouts/DashboardLayout'

const AdminDashboard = () => {
  useUserAuth()

  const {user} = useContext(UserContext)
  return (
    <DashboardLayout activeMenu="Dashboard">Dashboard</DashboardLayout>
  )
}

export default AdminDashboard