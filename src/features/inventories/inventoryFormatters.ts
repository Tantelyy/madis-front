export function formatPrice(value: string | number): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Number(value))
}

export function formatMovementType(type: 'INCOMING' | 'ADJUSTMENT'): string {
  return type === 'INCOMING' ? 'Entrée' : 'Ajustement'
}
