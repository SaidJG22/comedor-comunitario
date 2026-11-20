import { Outlet, Navigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

// Admin y Responsable
const GestionRoute = () => {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.rol !== 'Administrador' && user.rol !== 'Responsable') {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export default GestionRoute
