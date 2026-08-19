import { requestJson } from '../../utils/apiClient'
import type { PaginationMeta } from '../../utils/paginationMeta'
import type { DashboardPeriod } from './dashboardDateRange'

export type ProfitabilityGranularity = 'HOUR' | 'WEEK' | 'MONTH'

export interface ProfitabilityAmounts {
  purchaseAmount: string
  revenue: string
  costOfGoodsSold: string
  profit: string
}

export interface ProfitabilityPoint extends ProfitabilityAmounts {
  key: string
  label: string
  from: string
  to: string
}

export interface ProfitabilityStatistics {
  period: {
    from: string
    to: string
    granularity: ProfitabilityGranularity
  }
  totals: ProfitabilityAmounts
  points: ProfitabilityPoint[]
}

export interface SalesStockItem {
  productId: number
  productName: string
  productTypeId: number
  productType: string
  soldQuantity: number
  currentStock: number
}

export interface SalesStockAnalysis {
  period: {
    from: string
    to: string
  }
  stockAsOf: string
  maximumQuantity: number
  data: SalesStockItem[]
  meta: PaginationMeta
}

export interface SalesStockParams {
  period: DashboardPeriod
  page: number
  limit: number
  productTypeId?: number
}

export function getProfitabilityStatistics(
  period: DashboardPeriod,
  signal?: AbortSignal,
): Promise<ProfitabilityStatistics> {
  const searchParams = createPeriodSearchParams(period)

  return requestJson<ProfitabilityStatistics>(
    `/dashboard/profitability?${searchParams}`,
    { signal },
  )
}

export function getSalesStockAnalysis(
  params: SalesStockParams,
  signal?: AbortSignal,
): Promise<SalesStockAnalysis> {
  const searchParams = createPeriodSearchParams(params.period)
  searchParams.set('page', String(params.page))
  searchParams.set('limit', String(params.limit))

  if (params.productTypeId !== undefined) {
    searchParams.set('productTypeId', String(params.productTypeId))
  }

  return requestJson<SalesStockAnalysis>(
    `/dashboard/sales-stock?${searchParams}`,
    { signal },
  )
}

function createPeriodSearchParams(period: DashboardPeriod): URLSearchParams {
  return new URLSearchParams({
    from: period.from.toISOString(),
    to: period.to.toISOString(),
    timezoneOffset: String(period.from.getTimezoneOffset()),
  })
}
