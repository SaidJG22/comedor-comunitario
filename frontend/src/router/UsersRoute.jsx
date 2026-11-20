import { Outlet, Navigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

const UsersRoute = () => {
  const { user } = useAuthStore()

  if (!user || !user.token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default UsersRoute
