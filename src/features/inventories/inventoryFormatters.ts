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

export function formatMovementType(type: 'INCOMING' | 'ADJUSTMENT'): string {
  return type === 'INCOMING' ? 'Entrée' : 'Ajustement'
}
