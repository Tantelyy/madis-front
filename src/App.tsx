import { useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { canAccessBackoffice } from './auth/accessControl'
import { logout, type AuthenticatedUser } from './auth/authApi'
import {
  clearStoredUser,
  readStoredUser,
  storeUser,
} from './auth/sessionStorage'
import { AppLayout } from './components/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { ProductReferentialsPage } from './pages/ProductReferentialsPage'
import { ProductsPage } from './pages/ProductsPage'
import { SuppliersPage } from './pages/SuppliersPage'
import { AdminRoute } from './routes/AdminRoute'

function App() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(() =>
    readStoredUser(),
  )

  function handleLoginSuccess(user: AuthenticatedUser): void {
    if (canAccessBackoffice(user)) {
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
          canAccessBackoffice(currentUser) ? (
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
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route
            path="/product-referentials"
            element={<ProductReferentialsPage />}
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
