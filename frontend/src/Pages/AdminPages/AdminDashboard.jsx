import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../context/userContext'
import { useUserAuth } from '../../hooks/useUserAuth'
import DashboardLayout from '../../Components/layouts/DashboardLayout'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { addThousandsSeparator } from '../../utils/helper'
import moment from 'moment'
import InfoCard from '../../Components/Cards/InfoCard'

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
    <DashboardLayout activeMenu="Dashboard">
            <div className="card my-3">
        <div className="">
          <div className="col-span-3">
            <h2 className="text-xl md:text-2xl">
              Good Day! {user?.name}
            </h2>
            <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
              {moment().format('dddd Do MMM YYYY')}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 md:gap-6 ">
          <InfoCard
             label='Total Loans'
             value={addThousandsSeparator(dashboardData?.charts?.loanDistribution?.All || 0)}
             color='bg-primary'
             />
          <InfoCard
             label='Active Loans'
             value={addThousandsSeparator(dashboardData?.charts?.loanDistribution?.active || 0)}
             color='bg-violet-500'
             />
          <InfoCard
             label='Approved Loans'
             value={addThousandsSeparator(dashboardData?.charts?.loanDistribution?.approved || 0)}
             color='bg-cyan-500'
             />
          <InfoCard
             label='Completed Loans'
             value={addThousandsSeparator(dashboardData?.charts?.loanDistribution?.completed || 0)}
             color='bg-lime-500'
             />
          <InfoCard
             label='Defaulted Loans'
             value={addThousandsSeparator(dashboardData?.charts?.loanDistribution?.defaulted || 0)}
             color='bg-red-500'
             />
          <InfoCard
             label='Pending Loans'
             value={addThousandsSeparator(dashboardData?.charts?.loanDistribution?.pending || 0)}
             color='bg-amber-700'
             />
          <InfoCard
             label='Rejected Loans'
             value={addThousandsSeparator(dashboardData?.charts?.loanDistribution?.rejected || 0)}
             color='bg-amber-700'
             />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard