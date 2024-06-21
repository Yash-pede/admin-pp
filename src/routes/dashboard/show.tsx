import { useGetIdentity } from '@refinedev/core'
import React from 'react'

const DashboardHome = () => {
  const {data} = useGetIdentity()
  console.log(data);  
  return (
    <div>DashboardHome</div>
  )
}

export default DashboardHome