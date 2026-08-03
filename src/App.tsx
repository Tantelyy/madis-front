import { useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import {
  canAccessBackoffice,
  canManageAccounts,
  canManageInventory,
  canSell,
  canViewStock,
} from './auth/accessControl'
import { logout, type AuthenticatedUser } from './auth/authApi'
import {
  canRoleUseCurrentDevice,
  DESKTOP_ONLY_ACCESS_MESSAGE,
} from './auth/deviceAccess'
import { storeLoginRedirectMessage } from './auth/loginRedirect'
import {
  clearStoredUser,
  readStoredUser,
  storeUser,
} from './auth/sessionStorage'
import { AppLayout } from './components/AppLayout'
import { SalesCartProvider } from './features/sales/SalesCartContext'
import { AccountsPage } from './pages/AccountsPage'
import { DashboardPage } from './pages/DashboardPage'
import { InventoryMovementsPage } from './pages/InventoryMovementsPage'
import { InventoriesPage } from './pages/InventoriesPage'
import { LoginPage } from './pages/LoginPage'
import { PendingSalesPage } from './pages/PendingSalesPage'
import { ProductReferentialsPage } from './pages/ProductReferentialsPage'
import { PricingGridPage } from './pages/PricingGridPage'
import { ProductsPage } from './pages/ProductsPage'
import { PromotionsPage } from './pages/PromotionsPage'
import { SalesPage } from './pages/SalesPage'
import { SalesHistoryPage } from './pages/SalesHistoryPage'
import { SellerApprovedSalesPage } from './pages/SellerApprovedSalesPage'
import { SuppliersPage } from './pages/SuppliersPage'
import { StockStatusPage } from './pages/StockStatusPage'
import { AdminRoute } from './routes/AdminRoute'

function readInitialUser(): AuthenticatedUser | null {
  const storedUser = readStoredUser()

  if (storedUser && !canRoleUseCurrentDevice(storedUser.role)) {
    clearStoredUser()
    storeLoginRedirectMessage(DESKTOP_ONLY_ACCESS_MESSAGE)
    return null
  }

  return storedUser
}

function App() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] =
    useState<AuthenticatedUser | null>(readInitialUser)

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
            <SalesCartProvider>
              <AppLayout
                user={currentUser}
                onLogout={() => {
                  void handleLogout()
                }}
              />
            </SalesCartProvider>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route
            path="/sales"
            element={
              canSell(currentUser) && currentUser ? (
                <SalesPage user={currentUser} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/sales/history"
            element={
              canSell(currentUser) && currentUser ? (
                <SalesHistoryPage user={currentUser} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/sales/pending"
            element={
              currentUser?.role === 'ADMIN' ? (
                <PendingSalesPage />
              ) : (
                <Navigate to="/sales" replace />
              )
            }
          />
          <Route
            path="/sales/approvals"
            element={
              currentUser?.role === 'SELLER' ? (
                <SellerApprovedSalesPage />
              ) : (
                <Navigate to="/sales" replace />
              )
            }
          />
          <Route
            path="/promotions"
            element={
              canSell(currentUser) ? (
                <PromotionsPage />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/inventories"
            element={
              canManageInventory(currentUser) ? (
                <InventoriesPage />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/inventory-movements"
            element={
              canManageInventory(currentUser) ? (
                <InventoryMovementsPage />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/stock-status"
            element={
              canViewStock(currentUser) ? (
                <StockStatusPage />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/product-referentials"
            element={<ProductReferentialsPage />}
          />
          <Route path="/pricing-grid" element={<PricingGridPage />} />
          <Route
            path="/accounts"
            element={
              canManageAccounts(currentUser) ? (
                <AccountsPage currentUserId={currentUser?.id ?? null} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
