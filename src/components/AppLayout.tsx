import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  canManageAccounts,
  canManageInventory,
  canManageMargin,
  canManageProducts,
  canManageSuppliers,
  canSell,
} from '../auth/accessControl'
import type { AuthenticatedUser } from '../auth/authApi'
import { SalesCartDrawer } from '../features/sales/SalesCartDrawer'
import { useSalesCart } from '../features/sales/salesCart'

interface NavigationItem {
  label: string
  path: string
  icon: string
}

interface AppLayoutProps {
  user: AuthenticatedUser | null
  onLogout: () => void
}

const navigationItems: readonly NavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'D',
  },
  {
    label: 'Fournisseurs',
    path: '/suppliers',
    icon: 'F',
  },
  {
    label: 'Produits',
    path: '/products',
    icon: 'P',
  },
  {
    label: 'Vente',
    path: '/sales',
    icon: 'V',
  },
  {
    label: 'Promotions',
    path: '/promotions',
    icon: '%',
  },
  {
    label: 'Entrée en stock',
    path: '/inventories',
    icon: 'ES',
  },
  {
    label: 'Marge règlementaire',
    path: '/pricing-grid',
    icon: 'MR',
  },
  {
    label: 'Référentiels produits',
    path: '/product-referentials',
    icon: 'R',
  },
  {
    label: 'Comptes',
    path: '/accounts',
    icon: 'C',
  },
]

export function AppLayout({ user, onLogout }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false)
  const { itemCount } = useSalesCart()

  if (!user) {
    return null
  }

  const visibleNavigationItems = navigationItems.filter(
    (item) =>
      (item.path !== '/suppliers' || canManageSuppliers(user)) &&
      (item.path !== '/products' || canManageProducts(user)) &&
      (item.path !== '/inventories' || canManageInventory(user)) &&
      (item.path !== '/pricing-grid' || canManageMargin(user)) &&
      (item.path !== '/product-referentials' || canManageProducts(user)) &&
      (item.path !== '/accounts' || canManageAccounts(user)) &&
      (!item.path.startsWith('/sales') || canSell(user)) &&
      (item.path !== '/promotions' || canSell(user)),
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
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white shadow-xl shadow-slate-200/70 transition-[width,transform] duration-200 ${
          isSidebarOpen
            ? 'w-72 translate-x-0'
            : 'w-20 -translate-x-full lg:translate-x-0'
        }`}
        aria-label="Menu principal"
      >
        <div
          className={`flex h-20 shrink-0 items-center border-b border-slate-200 ${
            isSidebarOpen ? 'gap-3 px-6' : 'justify-center px-3'
          }`}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-xl font-bold text-teal-800">
            M
          </div>
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
                <span className="text-lg leading-none" aria-hidden="true">
                  x
                </span>
              </button>
            </>
          ) : null}
        </div>

        <nav
          className={`min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain py-6 ${
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
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-bold shadow-sm">
                {item.icon}
              </span>
              {isSidebarOpen ? item.label : null}
              {!isSidebarOpen ? (
                <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                  {item.label}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>

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
            onClick={isSidebarOpen ? onLogout : () => setIsSidebarOpen(true)}
            className="group relative flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50 focus:outline-none focus:ring-4 focus:ring-teal-100"
            aria-label={isSidebarOpen ? 'Se déconnecter' : 'Ouvrir le menu'}
            title={isSidebarOpen ? 'Se déconnecter' : 'Ouvrir le menu'}
          >
            <span aria-hidden="true">{isSidebarOpen ? '' : '>'}</span>
            {isSidebarOpen ? <span>Se déconnecter</span> : null}
            {!isSidebarOpen ? (
              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                Ouvrir le menu
              </span>
            ) : null}
          </button>
        </div>
      </aside>

      <div
        className={`transition-[padding] duration-200 ${
          isSidebarOpen ? 'lg:pl-72' : 'lg:pl-20'
        }`}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-teal-700 shadow-sm transition hover:bg-teal-50 ${
              isSidebarOpen ? 'lg:invisible' : 'lg:hidden'
            }`}
            aria-label="Ouvrir le menu"
            title="Ouvrir le menu"
          >
            <span className="text-xl leading-none" aria-hidden="true">
              =
            </span>
          </button>

          <div className="ml-auto flex items-center gap-3">
            {canSell(user) ? (
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-bold text-teal-800 hover:bg-teal-100"
                aria-label={`Ouvrir le panier, ${itemCount} produit(s)`}
              >
                Panier
                {itemCount > 0 ? (
                  <span className="ml-2 rounded-full bg-teal-700 px-2 py-0.5 text-xs text-white">
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
