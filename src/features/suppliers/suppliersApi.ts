import { API_BASE_URL } from '../../auth/authApi'

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
  sortBy?: 'createdAt' | 'updatedAt' | 'deletedAt'
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

interface BackendErrorResponse {
  message?: string | string[]
  error?: string
  statusCode?: number
}

function isBackendErrorResponse(value: unknown): value is BackendErrorResponse {
  return typeof value === 'object' && value !== null
}

function formatBackendError(errorBody: unknown): string {
  if (!isBackendErrorResponse(errorBody)) {
    return 'Une erreur est survenue. Veuillez réessayer.'
  }

  if (Array.isArray(errorBody.message)) {
    return errorBody.message.join(' ')
  }

  if (typeof errorBody.message === 'string') {
    return errorBody.message
  }

  if (typeof errorBody.error === 'string') {
    return errorBody.error
  }

  return 'Une erreur est survenue. Veuillez réessayer.'
}

async function readErrorBody(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

async function requestJson<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
  } catch {
    throw new Error(
      'Impossible de contacter le serveur. Vérifiez que le backend est démarré.',
    )
  }

  if (!response.ok) {
    throw new Error(formatBackendError(await readErrorBody(response)))
  }

  return response.json() as Promise<TResponse>
}

async function requestEmpty(path: string, init?: RequestInit): Promise<void> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      ...init,
      headers: {
        ...init?.headers,
      },
    })
  } catch {
    throw new Error(
      'Impossible de contacter le serveur. Vérifiez que le backend est démarré.',
    )
  }

  if (!response.ok) {
    throw new Error(formatBackendError(await readErrorBody(response)))
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
