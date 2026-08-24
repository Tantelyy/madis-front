import { requestJson } from '../../utils/apiClient'
import { listAllPages } from '../../utils/paginatedFetch'

export interface StockLot {
  id: number
  expiredAt: string | null
  remainingQuantity: number
}

export interface StockSummary {
  productId: number
  name: string
  reference: string
  remainingQuantity: number
  lots: StockLot[]
}

export interface ListStockSummaryParams {
  page: number
  limit: number
  search?: string
  expiresBefore?: string
  sortBy?: 'name' | 'reference' | 'remainingQuantity'
  order?: 'asc' | 'desc'
}

export interface PaginatedStockSummary {
  data: StockSummary[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface StockLimit {
  id: number
  createdAt: string
  createdBy: number
  value: number
}

export function listStockSummary(
  params: ListStockSummaryParams,
): Promise<PaginatedStockSummary> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    sortBy: params.sortBy ?? 'name',
    order: params.order ?? 'asc',
  })

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim())
  }

  if (params.expiresBefore) {
    searchParams.set('expiresBefore', params.expiresBefore)
  }

  return requestJson<PaginatedStockSummary>(
    `/inventories/stock-summary?${searchParams}`,
  )
}

export function listAllStockSummary(
  params: Omit<ListStockSummaryParams, 'page' | 'limit'>,
): Promise<StockSummary[]> {
  return listAllPages((page) =>
    listStockSummary({ ...params, page, limit: 100 }),
  )
}

export function getStockLimit(): Promise<StockLimit> {
  return requestJson<StockLimit>('/inventories/stock-limit')
}

export function createStockLimit(value: number): Promise<StockLimit> {
  return requestJson<StockLimit>('/inventories/stock-limit', {
    method: 'POST',
    body: JSON.stringify({ value }),
  })
}
