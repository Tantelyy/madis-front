import type { PricingRule, PricingRulePayload } from './pricingApi'

export interface EditablePricingRule {
  key: string
  minPurchasePrice: string
  maxPurchasePrice: string
  retailMarginPercent: string
  wholesaleMarginPercent: string
}

export type EditablePricingRuleField = Exclude<keyof EditablePricingRule, 'key'>

export interface CalculatedPricingRule {
  retailAverage: number
  wholesaleAverage: number
  retailPrice: number
  wholesalePrice: number
}

export function parseInputNumber(value: string): number {
  if (!value.trim()) {
    return Number.NaN
  }

  return Number(value.replace(',', '.'))
}

export function buildEditablePricingRules(
  pricingRules: readonly PricingRule[],
): EditablePricingRule[] {
  return pricingRules.map((pricingRule) => ({
    key: String(pricingRule.id),
    minPurchasePrice: String(pricingRule.minPurchasePrice),
    maxPurchasePrice: String(pricingRule.maxPurchasePrice),
    retailMarginPercent: String(Number(pricingRule.retailMarginPercent)),
    wholesaleMarginPercent: String(
      Number(pricingRule.wholesaleMarginPercent),
    ),
  }))
}

export function calculatePricingRule(
  pricingRule: EditablePricingRule,
): CalculatedPricingRule {
  const minPurchasePrice = parseInputNumber(pricingRule.minPurchasePrice)
  const maxPurchasePrice = parseInputNumber(pricingRule.maxPurchasePrice)
  const retailMarginPercent = parseInputNumber(
    pricingRule.retailMarginPercent,
  )
  const wholesaleMarginPercent = parseInputNumber(
    pricingRule.wholesaleMarginPercent,
  )

  if (
    !Number.isFinite(minPurchasePrice) ||
    !Number.isFinite(maxPurchasePrice) ||
    !Number.isFinite(retailMarginPercent) ||
    !Number.isFinite(wholesaleMarginPercent)
  ) {
    return {
      retailAverage: Number.NaN,
      wholesaleAverage: Number.NaN,
      retailPrice: Number.NaN,
      wholesalePrice: Number.NaN,
    }
  }

  const retailAverage = calculateAverageMargin(
    minPurchasePrice,
    maxPurchasePrice,
    retailMarginPercent,
  )
  const wholesaleAverage = calculateAverageMargin(
    minPurchasePrice,
    maxPurchasePrice,
    wholesaleMarginPercent,
  )

  return {
    retailAverage,
    wholesaleAverage,
    retailPrice: maxPurchasePrice + retailAverage,
    wholesalePrice: maxPurchasePrice + wholesaleAverage,
  }
}

export function validatePricingRules(
  editablePricingRules: readonly EditablePricingRule[],
): string {
  if (editablePricingRules.length === 0) {
    return 'Ajoutez au moins une tranche de prix.'
  }

  const pricingRules = buildPricingRulePayload(editablePricingRules)

  if (
    pricingRules.some(
      (pricingRule) =>
        !Number.isInteger(pricingRule.minPurchasePrice) ||
        !Number.isInteger(pricingRule.maxPurchasePrice) ||
        !Number.isFinite(pricingRule.retailMarginPercent) ||
        !Number.isFinite(pricingRule.wholesaleMarginPercent),
    )
  ) {
    return 'Renseignez des prix entiers et des marges valides.'
  }

  if (
    pricingRules.some(
      (pricingRule) =>
        pricingRule.minPurchasePrice < 0 ||
        pricingRule.maxPurchasePrice < pricingRule.minPurchasePrice ||
        pricingRule.retailMarginPercent < 0 ||
        pricingRule.retailMarginPercent > 100 ||
        pricingRule.wholesaleMarginPercent < 0 ||
        pricingRule.wholesaleMarginPercent > 100,
    )
  ) {
    return 'Vérifiez les bornes de prix et les pourcentages de marge.'
  }

  if (pricingRules[0].minPurchasePrice !== 0) {
    return 'La première tranche doit commencer à 0.'
  }

  for (let index = 1; index < pricingRules.length; index += 1) {
    const previousRule = pricingRules[index - 1]
    const currentRule = pricingRules[index]

    if (currentRule.minPurchasePrice !== previousRule.maxPurchasePrice + 1) {
      return 'Les tranches ne doivent contenir aucun trou ni chevauchement.'
    }
  }

  return ''
}

export function buildPricingRulePayload(
  editablePricingRules: readonly EditablePricingRule[],
): PricingRulePayload[] {
  return editablePricingRules
    .map((pricingRule) => ({
      minPurchasePrice: parseInputNumber(pricingRule.minPurchasePrice),
      maxPurchasePrice: parseInputNumber(pricingRule.maxPurchasePrice),
      retailMarginPercent: parseInputNumber(pricingRule.retailMarginPercent),
      wholesaleMarginPercent: parseInputNumber(
        pricingRule.wholesaleMarginPercent,
      ),
    }))
    .sort(
      (firstRule, secondRule) =>
        firstRule.minPurchasePrice - secondRule.minPurchasePrice,
    )
}

function calculateAverageMargin(
  minPurchasePrice: number,
  maxPurchasePrice: number,
  marginPercent: number,
): number {
  const basePrice =
    minPurchasePrice === 0
      ? maxPurchasePrice
      : (minPurchasePrice + maxPurchasePrice) / 2

  return Number(((basePrice * marginPercent) / 100).toFixed(2))
}
