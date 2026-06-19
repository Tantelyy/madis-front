import { Navigate, Outlet } from 'react-router-dom'
import { canAccessBackoffice } from '../auth/accessControl'
import type { AuthenticatedUser } from '../auth/authApi'

interface AdminRouteProps {
  user: AuthenticatedUser | null
}

export function AdminRoute({ user }: AdminRouteProps) {
  if (!canAccessBackoffice(user)) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
