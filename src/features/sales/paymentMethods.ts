export const PAYMENT_METHOD_OPTIONS = [
  { value: 'CASH', label: 'Espèces' },
  { value: 'MVOLA', label: 'MVola' },
  { value: 'AIRTEL_MONEY', label: 'Airtel Money' },
  { value: 'ORANGE_MONEY', label: 'Orange Money' },
  { value: 'CHECK', label: 'Chèque' },
  { value: 'BANK_TRANSFER', label: 'Virement bancaire' },
] as const

export type PaymentMethod = (typeof PAYMENT_METHOD_OPTIONS)[number]['value']

export function getPaymentMethodLabel(paymentMethod: PaymentMethod): string {
  return (
    PAYMENT_METHOD_OPTIONS.find((option) => option.value === paymentMethod)
      ?.label ?? paymentMethod
  )
}
