import React, { useContext } from 'react'
import { UserContext } from '../../context/userContext'
import { useUserAuth } from '../../hooks/useUserAuth'

const AdminDashboard = () => {
  useUserAuth()

  const {user} = useContext(UserContext)
  return (
    <div>AdminDashboard{JSON.stringify(user)}</div>
  )
}

export default AdminDashboard