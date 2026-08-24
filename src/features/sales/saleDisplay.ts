import type { CartStatus, PaymentMethod } from './salesApi'
import { getPaymentMethodLabel } from './paymentMethods'

const SALE_STATUS_LABELS: Readonly<Record<CartStatus, string>> = {
  PENDING: 'En attente',
  VALIDATED: 'Validée',
  PAID: 'Payée',
  PARTIALLY_REFUNDED: 'Partiellement remboursée',
  REFUNDED: 'Remboursée',
  CANCELLED: 'Annulée',
}

export function formatSaleStatus(status: CartStatus): string {
  return SALE_STATUS_LABELS[status]
}

export function canGenerateSaleInvoice(status: CartStatus): boolean {
  return (
    status === 'PAID' ||
    status === 'PARTIALLY_REFUNDED' ||
    status === 'REFUNDED' ||
    status === 'CANCELLED'
  )
}

export function formatPaymentMethod(
  paymentMethod: PaymentMethod | null,
): string {
  return paymentMethod ? getPaymentMethodLabel(paymentMethod) : '-'
}

export function saleStatusClassName(status: CartStatus): string {
  const classNames: Readonly<Record<CartStatus, string>> = {
    PENDING: 'bg-amber-100 text-amber-800',
    VALIDATED: 'bg-blue-100 text-blue-800',
    PAID: 'bg-emerald-100 text-emerald-800',
    PARTIALLY_REFUNDED: 'bg-violet-50 text-violet-800',
    REFUNDED: 'bg-violet-100 text-violet-800',
    CANCELLED: 'bg-slate-200 text-slate-700',
  }

  return classNames[status]
}
