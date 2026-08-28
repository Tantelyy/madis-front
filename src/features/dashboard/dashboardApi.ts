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

export type ForecastStatus =
  | 'SUFFICIENT_STOCK'
  | 'STOCKOUT_EXPECTED'
  | 'OUT_OF_STOCK'

export interface ProductForecast {
  productId: number
  productName: string
  productReference: string
  productTypeId: number
  productType: string
  asOfDate: string
  forecastDays: number
  currentStock: number
  totalPredictedDemand: number
  remainingStockAfterHorizon: number
  status: ForecastStatus
  predictedStockoutDate: string | null
  daysUntilStockout: number | null
}

export interface StockValueByProductType {
  productTypeId: number
  productType: string
  value: string
  percentage: string
}

export interface StockFinancialValue {
  stockAsOf: string
  totalValue: string
  byProductType: StockValueByProductType[]
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

export function getStockFinancialValue(
  signal?: AbortSignal,
): Promise<StockFinancialValue> {
  return requestJson<StockFinancialValue>('/dashboard/stock-value', { signal })
}

export function getProductForecast(
  productId: number,
  signal?: AbortSignal,
): Promise<ProductForecast> {
  return requestJson<ProductForecast>(`/dashboard/forecasts/${productId}`, {
    signal,
  })
}

function createPeriodSearchParams(period: DashboardPeriod): URLSearchParams {
  return new URLSearchParams({
    from: period.from.toISOString(),
    to: period.to.toISOString(),
    timezoneOffset: String(period.from.getTimezoneOffset()),
  })
}
