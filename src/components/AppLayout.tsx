import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import type { AuthenticatedUser } from '../auth/authApi'

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
]

export function AppLayout({ user, onLogout }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-rose-50 text-slate-900">
      <div
        className={`fixed inset-0 z-30 bg-slate-950/40 transition-opacity lg:hidden ${
          isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-rose-100 bg-white shadow-xl shadow-rose-100/70 transition-transform duration-200 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menu principal"
      >
        <div className="flex h-20 items-center gap-3 border-b border-rose-100 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-xl font-bold text-rose-700">
            M
          </div>
          <div>
            <p className="text-base font-bold text-slate-950">Ma Distribution</p>
            <p className="text-xs font-medium text-slate-500">
              Gestion stock et vente
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                  isActive
                    ? 'bg-rose-100 text-rose-800'
                    : 'text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                }`
              }
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-bold shadow-sm">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-rose-100 p-4">
          <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-950">
              {user.userName}
            </p>
            <p className="mt-1 text-xs text-slate-500">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100"
            aria-label="Se déconnecter"
            title="Se déconnecter"
          >
            {/* <span aria-hidden="true">↪</span> */}
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-rose-100 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-700 shadow-sm lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <span className="text-xl leading-none" aria-hidden="true">
              ☰
            </span>
          </button>

          <div className="ml-auto text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
              Backoffice
            </p>
            <p className="text-sm font-semibold text-slate-700">{user.role}</p>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
