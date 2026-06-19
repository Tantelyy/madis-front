import { useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { logout, type AuthenticatedUser } from './auth/authApi'
import {
  clearStoredUser,
  readStoredUser,
  storeUser,
} from './auth/sessionStorage'
import { AppLayout } from './components/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { AdminRoute } from './routes/AdminRoute'

function App() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(() =>
    readStoredUser(),
  )

  function handleLoginSuccess(user: AuthenticatedUser): void {
    if (user.role === 'ADMIN') {
      storeUser(user)
      setCurrentUser(user)
      navigate('/dashboard', { replace: true })
      return
    }

    clearStoredUser()
    setCurrentUser(null)
  }

  async function handleLogout(): Promise<void> {
    try {
      await logout()
    } finally {
      clearStoredUser()
      setCurrentUser(null)
      navigate('/login', { replace: true })
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          currentUser?.role === 'ADMIN' ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          )
        }
      />
      <Route element={<AdminRoute user={currentUser} />}>
        <Route
          element={
            <AppLayout
              user={currentUser}
              onLogout={() => {
                void handleLogout()
              }}
            />
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
