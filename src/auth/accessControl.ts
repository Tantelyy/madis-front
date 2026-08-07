import type { AuthenticatedUser } from './authApi'

const SUPPLIER_PERMISSIONS = ['ALL', 'CAN_SUPPLIERS', 'CAN_SUPPLIER'] as const
const PRODUCT_PERMISSIONS = ['ALL', 'CAN_PRODUCTS'] as const
const MARGIN_PERMISSIONS = ['ALL', 'CAN_MARGE'] as const
const INVENTORY_PERMISSIONS = ['ALL', 'CAN_INVENTORY'] as const
const ACCOUNT_PERMISSIONS = ['ALL', 'CAN_MANAGE_ACCOUNTS'] as const
const SALE_PERMISSIONS = ['ALL', 'CAN_SELL'] as const
const STOCK_VIEW_PERMISSIONS = [
  'ALL',
  'CAN_VIEW_STOCK',
  'CAN_MANAGE_ACCOUNTS',
] as const

export function canSell(user: AuthenticatedUser | null): boolean {
  if (!user) {
    return false
  }

  return (
    user.role === 'ADMIN' ||
    user.role === 'SELLER' ||
    SALE_PERMISSIONS.some((permission) => user.permissions.includes(permission))
  )
}

export function canManageSuppliers(user: AuthenticatedUser | null): boolean {
  if (!user) {
    return false
  }

  return (
    user.role === 'ADMIN' ||
    SUPPLIER_PERMISSIONS.some((permission) =>
      user.permissions.includes(permission),
    )
  )
}

export function canManageProducts(user: AuthenticatedUser | null): boolean {
  if (!user) {
    return false
  }

  return (
    user.role === 'ADMIN' ||
    PRODUCT_PERMISSIONS.some((permission) =>
      user.permissions.includes(permission),
    )
  )
}

export function canManageMargin(user: AuthenticatedUser | null): boolean {
  if (!user) {
    return false
  }

  return (
    user.role === 'ADMIN' ||
    MARGIN_PERMISSIONS.some((permission) =>
      user.permissions.includes(permission),
    )
  )
}

export function canManageInventory(user: AuthenticatedUser | null): boolean {
  if (!user) {
    return false
  }

  return (
    user.role === 'ADMIN' ||
    user.role === 'STOCK_MANAGER' ||
    INVENTORY_PERMISSIONS.some((permission) =>
      user.permissions.includes(permission),
    )
  )
}

export function canViewDashboard(user: AuthenticatedUser | null): boolean {
  return Boolean(
    user && (user.role === 'ADMIN' || user.permissions.includes('ALL')),
  )
}

export function canManageAccounts(user: AuthenticatedUser | null): boolean {
  if (!user) {
    return false
  }

  return (
    user.role === 'ADMIN' ||
    ACCOUNT_PERMISSIONS.some((permission) =>
      user.permissions.includes(permission),
    )
  )
}

export function canViewStock(user: AuthenticatedUser | null): boolean {
  if (!user) {
    return false
  }

  return (
    user.role === 'ADMIN' ||
    user.role === 'STOCK_MANAGER' ||
    STOCK_VIEW_PERMISSIONS.some((permission) =>
      user.permissions.includes(permission),
    )
  )
}

export function canAccessBackoffice(user: AuthenticatedUser | null): boolean {
  return (
    canManageSuppliers(user) ||
    canManageProducts(user) ||
    canManageMargin(user) ||
    canManageInventory(user) ||
    canManageAccounts(user) ||
    canViewStock(user) ||
    canSell(user)
  )
}

export function getHomePath(user: AuthenticatedUser | null): string {
  if (canViewDashboard(user)) {
    return '/dashboard'
  }

  if (user?.role === 'STOCK_MANAGER') {
    return '/inventories'
  }

  if (user?.role === 'SELLER') {
    return '/sales'
  }

  if (canManageInventory(user)) {
    return '/inventories'
  }

  if (canSell(user)) {
    return '/sales'
  }

  if (canManageSuppliers(user)) {
    return '/suppliers'
  }

  if (canManageProducts(user)) {
    return '/products'
  }

  if (canManageMargin(user)) {
    return '/pricing-grid'
  }

  if (canManageAccounts(user)) {
    return '/accounts'
  }

  if (canViewStock(user)) {
    return '/stock-status'
  }

  return '/login'
}
