import { requestEmpty, requestJson } from '../../utils/apiClient'
import type { UserRole } from '../../auth/authApi'

export interface Permission {
  id: number
  label: string
  code: string
  descriptions: string | null
}

export interface Role {
  id: number
  label: UserRole
  permissions?: Permission[]
}

export interface Account {
  id: number
  email: string
  userName: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  roleId: number
  role?: Role
  permissions?: Permission[]
}

export interface AccountPayload {
  userName: string
  email: string
  password?: string
  role: UserRole
  permissions: string[]
}

export interface CreateAccountPayload extends AccountPayload {
  password: string
}

export interface ListAccountsParams {
  page: number
  limit: number
  search?: string
  sortBy?: 'userName' | 'email' | 'createdAt' | 'updatedAt'
  order?: 'asc' | 'desc'
}

export interface PaginatedAccounts {
  data: Account[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function listAccounts(
  params: ListAccountsParams,
): Promise<PaginatedAccounts> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    sortBy: params.sortBy ?? 'createdAt',
    order: params.order ?? 'desc',
  })

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim())
  }

  return requestJson<PaginatedAccounts>(`/users?${searchParams}`)
}

export function listRoles(): Promise<Role[]> {
  return requestJson<Role[]>('/roles')
}

export function listPermissions(): Promise<Permission[]> {
  return requestJson<Permission[]>('/permissions')
}

export function createAccount(
  payload: CreateAccountPayload,
): Promise<Account> {
  return requestJson<Account>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateAccount(
  id: number,
  payload: AccountPayload,
): Promise<Account> {
  return requestJson<Account>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function disableAccount(id: number): Promise<void> {
  return requestEmpty(`/users/${id}`, {
    method: 'DELETE',
  })
}
