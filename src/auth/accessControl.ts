import type { AuthenticatedUser } from './authApi'

const SUPPLIER_PERMISSIONS = ['ALL', 'CAN_SUPPLIERS', 'CAN_SUPPLIER'] as const
const PRODUCT_PERMISSIONS = ['ALL', 'CAN_PRODUCTS'] as const
const MARGIN_PERMISSIONS = ['ALL', 'CAN_MARGE'] as const
const INVENTORY_PERMISSIONS = ['ALL', 'CAN_INVENTORY'] as const
const ACCOUNT_PERMISSIONS = ['ALL', 'CAN_MANAGE_ACCOUNTS'] as const
const SALE_PERMISSIONS = ['ALL', 'CAN_SELL'] as const

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
    INVENTORY_PERMISSIONS.some((permission) =>
      user.permissions.includes(permission),
    )
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

export function canAccessBackoffice(user: AuthenticatedUser | null): boolean {
  return (
    canManageSuppliers(user) ||
    canManageProducts(user) ||
    canManageMargin(user) ||
    canManageInventory(user) ||
    canManageAccounts(user) ||
    canSell(user)
  )
}
