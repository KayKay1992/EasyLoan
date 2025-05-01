import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../context/userContext'
import { useUserAuth } from '../../hooks/useUserAuth'
import DashboardLayout from '../../Components/layouts/DashboardLayout'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'

const AdminDashboard = () => {
  useUserAuth()

  const {user} = useContext(UserContext)

  const navigate = useNavigate()

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] =useState([]);
  const [barChartData, setBarChartData] = useState([])

  const getDashboardData = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.LOANS.GET_DASHBOARD_DATA
      );
      if(response.data){
        setDashboardData(response.data)
      }
    }catch(error){
      console.error('Error fetching users', error)
    }
  };

  useEffect(()=> {
    getDashboardData();
    return () => { }
  }, [])
  
  return (
    <DashboardLayout activeMenu="Dashboard">Dashboard</DashboardLayout>
  )
}

export default AdminDashboard