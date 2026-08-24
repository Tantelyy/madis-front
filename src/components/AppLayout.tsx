import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  canManageAccounts,
  canManageInventory,
  canManageMargin,
  canManageProducts,
  canManageSuppliers,
  canSell,
  canViewDashboard,
  canViewStock,
  getHomePath,
} from '../auth/accessControl'
import type { AuthenticatedUser } from '../auth/authApi'
import { MADIS_BRANDING } from '../config/branding'
import { SalesCartDrawer } from '../features/sales/SalesCartDrawer'
import { useSalesCart } from '../features/sales/salesCart'
import { AppIcon, type AppIconName } from './AppIcon'

interface NavigationItem {
  label: string
  path: string
  icon: AppIconName
  canAccess: (user: AuthenticatedUser) => boolean
}

interface AppLayoutProps {
  user: AuthenticatedUser | null
  onLogout: () => void
}

const navigationItems: readonly NavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'dashboard',
    canAccess: canViewDashboard,
  },
  {
    label: 'Fournisseurs',
    path: '/suppliers',
    icon: 'suppliers',
    canAccess: canManageSuppliers,
  },
  {
    label: 'Produits',
    path: '/products',
    icon: 'products',
    canAccess: canManageProducts,
  },
  {
    label: 'État de stock',
    path: '/stock-status',
    icon: 'stock',
    canAccess: canViewStock,
  },
  {
    label: 'Vente',
    path: '/sales',
    icon: 'sales',
    canAccess: canSell,
  },
  {
    label: 'Promotions',
    path: '/promotions',
    icon: 'promotions',
    canAccess: canSell,
  },
  {
    label: 'Entrée en stock',
    path: '/inventories',
    icon: 'inventory',
    canAccess: canManageInventory,
  },
  {
    label: 'Mouvement de stock',
    path: '/inventory-movements',
    icon: 'inventory-movements',
    canAccess: canManageInventory,
  },
  {
    label: 'Marge règlementaire',
    path: '/pricing-grid',
    icon: 'margin',
    canAccess: canManageMargin,
  },
  {
    label: 'Référentiels produits',
    path: '/product-referentials',
    icon: 'referentials',
    canAccess: canManageProducts,
  },
  {
    label: 'Comptes',
    path: '/accounts',
    icon: 'accounts',
    canAccess: canManageAccounts,
  },
]

export function AppLayout({ user, onLogout }: AppLayoutProps) {
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false)
  const { itemCount } = useSalesCart()

  if (!user) {
    return null
  }

  function handleLogoClick(): void {
    if (isSidebarOpen) {
      navigate(getHomePath(user))
      return
    }

    setIsSidebarOpen(true)
  }

  const visibleNavigationItems = navigationItems.filter((item) =>
    item.canAccess(user),
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div
        className={`fixed inset-0 z-30 bg-slate-950/40 transition-opacity lg:hidden ${
          isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex translate-x-0 flex-col border-r border-slate-200 bg-white shadow-xl shadow-slate-200/70 transition-[width] duration-200 ${
          isSidebarOpen ? 'w-72' : 'w-20'
        }`}
        aria-label="Menu principal"
      >
        <div
          className={`flex h-20 shrink-0 items-center border-b border-slate-200 ${
            isSidebarOpen ? 'gap-3 px-6' : 'justify-center px-3'
          }`}
        >
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-sm transition hover:border-teal-300 focus:outline-none focus:ring-4 focus:ring-teal-100"
            aria-label={isSidebarOpen ? "Aller à la page d'accueil" : 'Ouvrir le menu'}
            title={isSidebarOpen ? "Aller à la page d'accueil" : 'Ouvrir le menu'}
          >
            <img
              src={MADIS_BRANDING.logoPath}
              alt="Logo Ma Distribution"
              className="h-full w-full object-contain"
            />
          </button>
          {isSidebarOpen ? (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-slate-950">
                  Ma Distribution
                </p>
                <p className="text-xs font-medium text-slate-500">
                  Gestion stock et vente
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-teal-700"
                aria-label="Fermer le menu"
                title="Fermer le menu"
              >
                <AppIcon name="menu" />
              </button>
            </>
          ) : null}
        </div>

        <nav
          className={`min-h-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto overscroll-contain py-6 ${
            isSidebarOpen ? 'px-4' : 'px-3'
          }`}
        >
          {visibleNavigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/sales'}
              title={item.label}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsSidebarOpen(false)
                }
              }}
              className={({ isActive }) =>
                `group relative flex w-full items-center rounded-lg py-3 text-left text-sm font-semibold transition ${
                  isActive
                    ? 'bg-teal-100 text-teal-900'
                    : 'text-slate-600 hover:bg-teal-50 hover:text-teal-800'
                } ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'}`
              }
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-teal-700 shadow-sm">
                <AppIcon name={item.icon} />
              </span>
              {isSidebarOpen ? item.label : null}
            </NavLink>
          ))}
        </nav>

        {!isSidebarOpen ? (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="absolute -right-7 top-1/2 z-50 flex h-10 w-7 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-teal-200 bg-white text-teal-700 shadow-md transition hover:bg-teal-50 focus:outline-none focus:ring-4 focus:ring-inset focus:ring-teal-100"
            aria-label="Ouvrir le menu"
            title="Ouvrir le menu"
          >
            <AppIcon name="chevron-right" className="h-4 w-4" />
          </button>
        ) : null}

        <div
          className={`shrink-0 border-t border-slate-200 bg-white ${
            isSidebarOpen ? 'p-4' : 'p-3'
          }`}
        >
          {isSidebarOpen ? (
            <div className="mb-4 rounded-lg bg-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-950">
                {user.userName}
              </p>
              <p className="mt-1 text-xs text-slate-500">{user.email}</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={onLogout}
            className="group relative flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50 focus:outline-none focus:ring-4 focus:ring-teal-100"
            aria-label="Se déconnecter"
            title="Se déconnecter"
          >
            <AppIcon name="logout" />
            {isSidebarOpen ? <span>Se déconnecter</span> : null}
          </button>
        </div>
      </aside>

      <div
        className={`transition-[padding] duration-200 ${
          isSidebarOpen ? 'lg:pl-72' : 'pl-20'
        }`}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="ml-auto flex items-center gap-3">
            {canSell(user) ? (
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-teal-200 bg-teal-50 text-teal-800 transition hover:bg-teal-100 focus:outline-none focus:ring-4 focus:ring-teal-100"
                aria-label={`Ouvrir le panier, ${itemCount} produit(s)`}
                title="Ouvrir le panier"
              >
                <AppIcon name="sales" className="h-6 w-6" />
                {itemCount > 0 ? (
                  <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-teal-700 px-1 text-xs font-bold text-white shadow-sm">
                    {itemCount}
                  </span>
                ) : null}
              </button>
            ) : null}
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                Backoffice
              </p>
              <p className="text-sm font-semibold text-slate-700">{user.role}</p>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      {isCartOpen ? (
        <SalesCartDrawer
          user={user}
          onClose={() => setIsCartOpen(false)}
        />
      ) : null}
    </div>
  )
}
