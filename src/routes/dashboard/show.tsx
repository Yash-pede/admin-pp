import { useGetIdentity } from '@refinedev/core'

const DashboardHome = () => {
  const {data} = useGetIdentity()
  console.log(data);  
  return (
    <div>DashboardHome</div>
  )
}

export default DashboardHome