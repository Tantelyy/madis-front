import type { SalesCartItem } from './salesCart'
import { usesAutomaticWholesalePrice } from './salesRules'

export interface CartItemPricing {
  isWholesale: boolean
  promotionalQuantity: number
  standardQuantity: number
  promotionalUnitPrice: number | null
  standardUnitPrice: number | null
  subtotal: number | null
}

export interface PricedCartItem {
  item: SalesCartItem
  pricing: CartItemPricing
}

export interface CartPricingSummary {
  items: PricedCartItem[]
  total: number | null
}

export function calculateCartPricing(
  items: readonly SalesCartItem[],
): CartPricingSummary {
  const pricedItems = items.map((item) => ({
    item,
    pricing: calculateCartItemPricing(item),
  }))
  const total = pricedItems.reduce<number | null>(
    (currentTotal, { pricing }) => {
      if (currentTotal === null || pricing.subtotal === null) {
        return null
      }

      return currentTotal + pricing.subtotal
    },
    0,
  )

  return { items: pricedItems, total }
}

export function calculateCartItemPricing(
  item: SalesCartItem,
): CartItemPricing {
  const isWholesale =
    item.wholesale || usesAutomaticWholesalePrice(item.quantity)
  const promotionalUnitPrice = parsePrice(
    isWholesale
      ? item.product.wholesalePrice
      : item.product.retailPrice,
  )
  const standardUnitPrice = parsePrice(
    isWholesale
      ? item.product.baseWholesalePrice
      : item.product.baseRetailPrice,
  )
  const promotionalQuantity =
    item.product.promotion?.type === 'REDUCTION'
      ? Math.min(item.quantity, item.product.promotionStock)
      : 0
  const standardQuantity = item.quantity - promotionalQuantity
  const subtotal = calculateSubtotal(
    promotionalQuantity,
    promotionalUnitPrice,
    standardQuantity,
    standardUnitPrice,
  )

  return {
    isWholesale,
    promotionalQuantity,
    standardQuantity,
    promotionalUnitPrice,
    standardUnitPrice,
    subtotal,
  }
}

function calculateSubtotal(
  promotionalQuantity: number,
  promotionalUnitPrice: number | null,
  standardQuantity: number,
  standardUnitPrice: number | null,
): number | null {
  if (
    (promotionalQuantity > 0 && promotionalUnitPrice === null) ||
    (standardQuantity > 0 && standardUnitPrice === null)
  ) {
    return null
  }

  return (
    promotionalQuantity * (promotionalUnitPrice ?? 0) +
    standardQuantity * (standardUnitPrice ?? 0)
  )
}

function parsePrice(value: string | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null
  }

  const price = Number(value)

  return Number.isFinite(price) ? price : null
}
