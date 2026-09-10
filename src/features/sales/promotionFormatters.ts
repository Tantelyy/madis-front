import { formatPrice } from '../../utils/displayFormatters'
import type { SaleCatalogPromotion } from './salesApi'

export function formatPromotionBadge(
  promotion: SaleCatalogPromotion,
): string {
  if (promotion.type === 'BUY_X_GET_N') {
    if (promotion.productOfferName) {
      return `Promotion · Achetez ${promotion.buyQuantity ?? 0}, obtenez ${promotion.freeQuantity ?? 0} ${promotion.productOfferName}`
    }

    return `Promotion · Achetez ${promotion.buyQuantity ?? 0}, obtenez ${promotion.freeQuantity ?? 0}`
  }

  const value = Number(promotion.value ?? 0)

  return promotion.unit === 'PERCENT'
    ? `Promotion -${value}%`
    : `Promotion -${formatPrice(String(value))}`
}
