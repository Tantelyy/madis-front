export function formatPrice(value: string | number): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Number(value))
}

export function formatRoundedPrice(value: string | number): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(Number(value)))
}

export const INVENTORY_MOVEMENT_TYPE_OPTIONS: readonly {
  value: InventoryMovementType
  label: string
}[] = [
  { value: 'INCOMING', label: 'Entrée' },
  { value: 'ADJUSTMENT', label: 'Ajustement' },
  { value: 'SALE', label: 'Vente' },
  { value: 'PROMOTION_GIFT', label: 'Produit offert par promotion' },
  { value: 'REFUND', label: 'Remboursement' },
  { value: 'CANCELLATION', label: 'Annulation' },
]

const INVENTORY_MOVEMENT_TYPE_LABELS: Readonly<
  Record<InventoryMovementType, string>
> = Object.fromEntries(
  INVENTORY_MOVEMENT_TYPE_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<InventoryMovementType, string>

export function formatMovementType(type: InventoryMovementType): string {
  return INVENTORY_MOVEMENT_TYPE_LABELS[type]
}
import type { InventoryMovementType } from './inventoriesApi'
