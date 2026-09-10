import { requestJson } from '../../utils/apiClient'

export type PricingGridStatus = 'ACTIVE' | 'ARCHIVED' | 'DRAFT'

export interface PricingRule {
  id: number
  pricingGridId: number
  minPurchasePrice: number
  maxPurchasePrice: number
  retailMarginPercent: string
  wholesaleMarginPercent: string
  retailAverage: string
  wholesaleAverage: string
}

export interface PricingGrid {
  id: number
  status: PricingGridStatus
  effectiveFrom: string
  effectiveTo: string | null
  createdAt: string
  createdBy: number
  updatedAt: string
  pricingRules: PricingRule[]
}

export interface PricingRulePayload {
  minPurchasePrice: number
  maxPurchasePrice: number
  retailMarginPercent: number
  wholesaleMarginPercent: number
}

export interface UpdatePricingGridPayload {
  pricingRules: PricingRulePayload[]
}

export function getActivePricingGrid(): Promise<PricingGrid> {
  return requestJson<PricingGrid>('/pricing-grids/active')
}

export function updatePricingGrid(
  payload: UpdatePricingGridPayload,
): Promise<PricingGrid> {
  return requestJson<PricingGrid>('/pricing-grids', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
