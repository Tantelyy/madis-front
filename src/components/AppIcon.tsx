import type { ReactNode } from 'react'

export type AppIconName =
  | 'accounts'
  | 'chevron-right'
  | 'dashboard'
  | 'inventory'
  | 'logout'
  | 'margin'
  | 'menu'
  | 'products'
  | 'promotions'
  | 'referentials'
  | 'sales'
  | 'stock'
  | 'suppliers'

interface AppIconProps {
  name: AppIconName
  className?: string
}

export function AppIcon({ name, className = 'h-5 w-5' }: AppIconProps) {
  const paths: Readonly<Record<AppIconName, ReactNode>> = {
    accounts: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    'chevron-right': <path d="m9 18 6-6-6-6" />,
    dashboard: (
      <>
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </>
    ),
    inventory: (
      <>
        <path d="M21 8v13H3V8" />
        <path d="M1 3h22v5H1zM12 3v11" />
        <path d="m8 11 4 4 4-4" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      </>
    ),
    margin: (
      <>
        <path d="M3 3v18h18" />
        <path d="m7 16 4-5 4 3 5-7" />
      </>
    ),
    menu: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </>
    ),
    products: (
      <>
        <path d="m21 8-9 5-9-5 9-5 9 5Z" />
        <path d="m3 8 9 5 9-5v9l-9 5-9-5V8Z" />
      </>
    ),
    promotions: (
      <>
        <path d="M20.59 13.41 11 3.83V3H4v7h.83l9.58 9.59a2 2 0 0 0 2.82 0l3.36-3.36a2 2 0 0 0 0-2.82Z" />
        <circle cx="7.5" cy="6.5" r="1" />
      </>
    ),
    referentials: (
      <>
        <path d="M9 5h6M9 9h6M9 13h4" />
        <path d="M16 3h3v18H5V3h3" />
        <rect width="8" height="4" x="8" y="1" rx="1" />
      </>
    ),
    sales: (
      <>
        <circle cx="9" cy="20" r="1" />
        <circle cx="19" cy="20" r="1" />
        <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.6L22 8H6" />
      </>
    ),
    stock: (
      <>
        <path d="M3 9 12 4l9 5v11H3V9Z" />
        <path d="M7 13h3v7H7zM14 13h3v7h-3z" />
      </>
    ),
    suppliers: (
      <>
        <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
