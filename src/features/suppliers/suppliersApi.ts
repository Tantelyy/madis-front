import { requestEmpty, requestJson } from '../../utils/apiClient'

export interface SupplierUser {
  id: number
  userName: string
  email: string
}

export interface Supplier {
  id: number
  name: string
  address: string | null
  phone: string | null
  email: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  createdBy: number
  updatedBy: number | null
  deletedBy: number | null
  createdByUser?: SupplierUser
  updatedByUser?: SupplierUser | null
  deletedByUser?: SupplierUser | null
}

export interface SupplierPayload {
  name: string
  address?: string
  phone?: string
  email?: string
}

export interface ListSuppliersParams {
  page: number
  limit: number
  search?: string
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'deletedAt'
  order?: 'asc' | 'desc'
}

export interface PaginatedSuppliers {
  data: Supplier[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function listSuppliers(
  params: ListSuppliersParams,
): Promise<PaginatedSuppliers> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    sortBy: params.sortBy ?? 'createdAt',
    order: params.order ?? 'desc',
  })

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim())
  }

  return requestJson<PaginatedSuppliers>(`/suppliers?${searchParams}`)
}

export function createSupplier(payload: SupplierPayload): Promise<Supplier> {
  return requestJson<Supplier>('/suppliers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateSupplier(
  id: number,
  payload: SupplierPayload,
): Promise<Supplier> {
  return requestJson<Supplier>(`/suppliers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteSupplier(id: number): Promise<void> {
  return requestEmpty(`/suppliers/${id}`, {
    method: 'DELETE',
  })
}
