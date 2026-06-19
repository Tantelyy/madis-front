import type { AuthenticatedUser } from './authApi'

const SUPPLIER_PERMISSIONS = ['ALL', 'CAN_SUPPLIERS', 'CAN_SUPPLIER'] as const

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

export function canAccessBackoffice(user: AuthenticatedUser | null): boolean {
  return canManageSuppliers(user)
}
