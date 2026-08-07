import { requestJson } from '../../utils/apiClient'
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

export function getProfitabilityStatistics(
  period: DashboardPeriod,
  signal?: AbortSignal,
): Promise<ProfitabilityStatistics> {
  const searchParams = new URLSearchParams({
    from: period.from.toISOString(),
    to: period.to.toISOString(),
    timezoneOffset: String(period.from.getTimezoneOffset()),
  })

  return requestJson<ProfitabilityStatistics>(
    `/dashboard/profitability?${searchParams}`,
    { signal },
  )
}
