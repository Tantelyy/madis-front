import { Navigate, Outlet } from 'react-router-dom'
import type { AuthenticatedUser } from '../auth/authApi'

interface AdminRouteProps {
  user: AuthenticatedUser | null
}

export function AdminRoute({ user }: AdminRouteProps) {
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
