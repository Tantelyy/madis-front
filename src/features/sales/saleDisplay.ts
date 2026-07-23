import type { CartStatus, PaymentMethod } from './salesApi'

const SALE_STATUS_LABELS: Readonly<Record<CartStatus, string>> = {
  PENDING: 'En attente',
  VALIDATED: 'Validée',
  PAID: 'Payée',
  REFUNDED: 'Remboursée',
  CANCELLED: 'Annulée',
}

const PAYMENT_METHOD_LABELS: Readonly<Record<PaymentMethod, string>> = {
  CASH: 'Espèces',
  MVOLA: 'MVola',
  AIRTEL_MONEY: 'Airtel Money',
  ORANGE_MONEY: 'Orange Money',
}

export function formatSaleStatus(status: CartStatus): string {
  return SALE_STATUS_LABELS[status]
}

export function canGenerateSaleInvoice(status: CartStatus): boolean {
  return (
    status === 'PAID' ||
    status === 'REFUNDED' ||
    status === 'CANCELLED'
  )
}

export function formatPaymentMethod(
  paymentMethod: PaymentMethod | null,
): string {
  return paymentMethod ? PAYMENT_METHOD_LABELS[paymentMethod] : '-'
}

export function saleStatusClassName(status: CartStatus): string {
  const classNames: Readonly<Record<CartStatus, string>> = {
    PENDING: 'bg-amber-100 text-amber-800',
    VALIDATED: 'bg-blue-100 text-blue-800',
    PAID: 'bg-emerald-100 text-emerald-800',
    REFUNDED: 'bg-violet-100 text-violet-800',
    CANCELLED: 'bg-slate-200 text-slate-700',
  }

  return classNames[status]
}
