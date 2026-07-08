import type { Permission, Role } from './accountsApi'

export function getPermissionCodes(permissions?: Permission[]): string[] {
  return permissions?.map((permission) => permission.code) ?? []
}

export function getRolePermissionCodes(role?: Role): string[] {
  return getPermissionCodes(role?.permissions)
}

export function mergePermissionCodes(...permissionGroups: string[][]): string[] {
  return Array.from(new Set(permissionGroups.flat()))
}
