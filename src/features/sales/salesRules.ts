export const AUTOMATIC_WHOLESALE_MIN_QUANTITY = 4

export function usesAutomaticWholesalePrice(quantity: number): boolean {
  return quantity >= AUTOMATIC_WHOLESALE_MIN_QUANTITY
}

export function normalizeWholesaleRequest(
  quantity: number,
  wholesaleRequested: boolean,
): boolean {
  return wholesaleRequested && !usesAutomaticWholesalePrice(quantity)
}

export function parseSaleQuantity(value: string): number | null {
  const quantity = Number(value)

  return Number.isInteger(quantity) && quantity >= 1 ? quantity : null
}
