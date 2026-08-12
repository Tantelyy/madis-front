import { requestJson } from '../../utils/apiClient'
import { listAllPages } from '../../utils/paginatedFetch'
import {
  appendDateRangeSearchParams,
  type DateRangeParams,
} from '../../utils/dateRange'
import type { Product } from '../products/productsApi'
import type { Supplier } from '../suppliers/suppliersApi'

export type InventoryMovementType =
  | 'INCOMING'
  | 'ADJUSTMENT'
  | 'SALE'
  | 'REFUND'
  | 'CANCELLATION'

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

export interface InventoryProductOption {
  id: number
  name: string
  reference: string
}

export interface InventorySupplierOption {
  id: number
  name: string
}

export interface InventoryFormOptions {
  products: InventoryProductOption[]
  suppliers: InventorySupplierOption[]
}

export interface InventoryImportSummary {
  rowsProcessed: number
  rowsSkipped: number
  inventoriesCreated: number
  lotsSkipped: number
  movementsCreated: number
  productsCreated: number
  marksCreated: number
  specificationsCreated: number
  formatsCreated: number
  productTypesCreated: number
  suppliersCreated: number
}

export interface ListInventoriesParams extends DateRangeParams {
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

export interface ListInventoryMovementsParams extends DateRangeParams {
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

  appendDateRangeSearchParams(searchParams, params)

  return requestJson<PaginatedInventories>(`/inventories?${searchParams}`)
}

export function listAllInventories(
  params: Omit<ListInventoriesParams, 'page' | 'limit'>,
): Promise<Inventory[]> {
  return listAllPages((page) =>
    listInventories({ ...params, page, limit: 100 }),
  )
}

export function getInventoryFormOptions(): Promise<InventoryFormOptions> {
  return requestJson<InventoryFormOptions>('/inventories/form-options')
}

export function createInventory(payload: InventoryPayload): Promise<Inventory> {
  return requestJson<Inventory>('/inventories', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function importInventoriesCsv(
  file: File,
): Promise<InventoryImportSummary> {
  const formData = new FormData()
  formData.append('file', file)

  return requestJson<InventoryImportSummary>('/inventories/import', {
    method: 'POST',
    body: formData,
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

  appendDateRangeSearchParams(searchParams, params)

  return requestJson<PaginatedInventoryMovements>(
    `/inventories/movements?${searchParams}`,
  )
}

export function listAllInventoryMovements(
  params: Omit<ListInventoryMovementsParams, 'page' | 'limit'>,
): Promise<InventoryMovement[]> {
  return listAllPages((page) =>
    listInventoryMovements({ ...params, page, limit: 100 }),
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

  appendDateRangeSearchParams(searchParams, params)

  return requestJson<PaginatedInventoryMovements>(
    `/inventories/${inventoryId}/movements?${searchParams}`,
  )
}
