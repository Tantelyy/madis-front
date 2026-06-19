import type { AuthenticatedUser, UserRole } from './authApi'

const AUTH_USER_STORAGE_KEY = 'madis.auth.user'
const userRoles: readonly UserRole[] = ['ADMIN', 'SELLER']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && userRoles.includes(value as UserRole)
}

function isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'number' &&
    typeof value.email === 'string' &&
    typeof value.userName === 'string' &&
    isUserRole(value.role) &&
    Array.isArray(value.permissions) &&
    value.permissions.every((permission) => typeof permission === 'string')
  )
}

export function readStoredUser(): AuthenticatedUser | null {
  const rawUser = window.sessionStorage.getItem(AUTH_USER_STORAGE_KEY)

  if (!rawUser) {
    return null
  }

  try {
    const parsedUser: unknown = JSON.parse(rawUser)
    return isAuthenticatedUser(parsedUser) ? parsedUser : null
  } catch {
    return null
  }
}

export function storeUser(user: AuthenticatedUser): void {
  window.sessionStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

export function clearStoredUser(): void {
  window.sessionStorage.removeItem(AUTH_USER_STORAGE_KEY)
}
