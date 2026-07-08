import { requestJson } from '../../utils/apiClient'
import type { Product } from '../products/productsApi'
import type { Supplier } from '../suppliers/suppliersApi'

export type InventoryMovementType = 'INCOMING' | 'ADJUSTMENT'

export interface InventoryUser {
  id: number
  userName: string
  email: string
}

export interface Inventory {
  id: number
  productId: number
  quantity: number
  createdAt: string
  updatedAt: string
  createdBy: number
  purchasePrice: string
  salePrice: string
  updatedBy: number | null
  supplierId: number
  wholesalePrice: string
  remainingQuantity: number
  expiredAt: string | null
  product?: Product
  supplier?: Supplier
  createdByUser?: InventoryUser
  updatedByUser?: InventoryUser | null
}

export interface InventoryMovement {
  id: number
  inventoryId: number
  incomingQuantity: number
  outgoingQuantity: number
  actorId: number
  createdAt: string
  updatedAt: string
  purchasePrice: string
  salePrice: string
  type: InventoryMovementType
  wholesalePrice: string
  actor?: InventoryUser
  inventory?: Inventory
}

export interface InventoryPayload {
  productId: number
  quantity: number
  purchasePrice: number
  salePrice?: number
  wholesalePrice?: number
  supplierId: number
  expiredAt?: string | null
}

export interface ListInventoriesParams {
  page: number
  limit: number
  search?: string
  sortBy?:
    | 'createdAt'
    | 'updatedAt'
    | 'quantity'
    | 'remainingQuantity'
    | 'purchasePrice'
    | 'salePrice'
    | 'wholesalePrice'
    | 'expiredAt'
  order?: 'asc' | 'desc'
}

export interface ListInventoryMovementsParams {
  page: number
  limit: number
  search?: string
  type?: InventoryMovementType
  inventoryId?: number
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedInventories {
  data: Inventory[]
  meta: PaginationMeta
}

export interface PaginatedInventoryMovements {
  data: InventoryMovement[]
  meta: PaginationMeta
}

export function listInventories(
  params: ListInventoriesParams,
): Promise<PaginatedInventories> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    sortBy: params.sortBy ?? 'createdAt',
    order: params.order ?? 'desc',
  })

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim())
  }

  return requestJson<PaginatedInventories>(`/inventories?${searchParams}`)
}

export function createInventory(
  payload: InventoryPayload,
): Promise<Inventory> {
  return requestJson<Inventory>('/inventories', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateInventory(
  id: number,
  payload: InventoryPayload,
): Promise<Inventory> {
  return requestJson<Inventory>(`/inventories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function listInventoryMovements(
  params: ListInventoryMovementsParams,
): Promise<PaginatedInventoryMovements> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  })

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim())
  }

  if (params.type) {
    searchParams.set('type', params.type)
  }

  if (params.inventoryId) {
    searchParams.set('inventoryId', String(params.inventoryId))
  }

  return requestJson<PaginatedInventoryMovements>(
    `/inventories/movements?${searchParams}`,
  )
}

export function listInventoryLineMovements(
  inventoryId: number,
  params: ListInventoryMovementsParams,
): Promise<PaginatedInventoryMovements> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  })

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim())
  }

  if (params.type) {
    searchParams.set('type', params.type)
  }

  return requestJson<PaginatedInventoryMovements>(
    `/inventories/${inventoryId}/movements?${searchParams}`,
  )
}
