import { useMemo, useState, type ChangeEvent } from 'react'
import type { AuthenticatedUser } from '../../auth/authApi'
import { Alert } from '../../components/Alert'
import { formatPrice } from '../../utils/displayFormatters'
import {
  createSale,
  downloadSaleInvoice,
  paySale,
  PAYMENT_METHOD_OPTIONS,
  type PaymentMethod,
} from './salesApi'
import { calculateCartPricing } from './cartPricing'
import { useSalesCart } from './salesCart'

interface SalesCartDrawerProps {
  user: AuthenticatedUser
  onClose: () => void
}

type CheckoutStep = 'CART' | 'CHOICE' | 'INVOICE'

export function SalesCartDrawer({ user, onClose }: SalesCartDrawerProps) {
  const { items, updateItem, removeItem, clearCart } = useSalesCart()
  const [step, setStep] = useState<CheckoutStep>('CART')
  const [customerName, setCustomerName] = useState<string>('')
  const [customerContact, setCustomerContact] = useState<string>('')
  const [customerAddress, setCustomerAddress] = useState<string>('')
  const [customerNif, setCustomerNif] = useState<string>('')
  const [customerStat, setCustomerStat] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const cartPricing = useMemo(() => calculateCartPricing(items), [items])
  const requiresAdminApproval =
    user.role === 'SELLER' && items.some((item) => item.wholesale)

  function saleItems() {
    return items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      wholesale: item.wholesale,
    }))
  }

  function resetCheckout(): void {
    clearCart()
    setStep('CART')
    setCustomerName('')
    setCustomerContact('')
    setCustomerAddress('')
    setCustomerNif('')
    setCustomerStat('')
  }

  async function sendApprovalRequest(): Promise<void> {
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const sale = await createSale({ items: saleItems() })
      resetCheckout()
      setSuccessMessage(
        `Vente n°${sale.id} envoyée pour validation administrative.`,
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible d'envoyer la demande.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function completeSale(withInvoice: boolean): Promise<void> {
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')
    let createdSaleId: number | null = null

    try {
      const sale = await createSale({
        paymentMethod,
        customerName: withInvoice ? customerName : undefined,
        customerContact: withInvoice ? customerContact : undefined,
        customerAddress: withInvoice ? customerAddress : undefined,
        customerNif: withInvoice ? customerNif : undefined,
        customerStat: withInvoice ? customerStat : undefined,
        items: saleItems(),
      })
      createdSaleId = sale.id

      if (sale.status !== 'VALIDATED') {
        throw new Error(
          `La vente n°${sale.id} nécessite une validation administrative.`,
        )
      }

      await paySale(sale.id, paymentMethod)
      resetCheckout()
      setSuccessMessage(`Vente n°${sale.id} marquée payée.`)

      if (withInvoice) {
        try {
          await downloadSaleInvoice(sale.id, {
            customerName,
            customerContact,
            customerAddress,
            customerNif,
            customerStat,
          })
          setSuccessMessage(
            `Vente n°${sale.id} marquée payée et facture téléchargée.`,
          )
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? `${error.message} La vente reste marquée payée et sa facture peut être retéléchargée depuis l'historique.`
              : `La facture n'a pas pu être téléchargée. La vente n°${sale.id} reste marquée payée.`,
          )
        }
      }
    } catch (error) {
      if (createdSaleId !== null) {
        resetCheckout()
      }
      setErrorMessage(
        error instanceof Error
          ? `${error.message}${
              createdSaleId !== null
                ? ` La vente n°${createdSaleId} est disponible dans l'historique.`
                : ''
            }`
          : "Impossible d'enregistrer la vente.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleQuantityChange(
    productId: number,
    wholesale: boolean,
    event: ChangeEvent<HTMLInputElement>,
  ): void {
    const quantity = Math.max(1, Number(event.target.value))
    updateItem(productId, quantity, wholesale)
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40" role="dialog" aria-modal>
      <div className="ml-auto flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
              Vente
            </p>
            <h2 className="text-xl font-bold text-slate-950">Votre panier</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            Fermer
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {errorMessage ? <Alert type="error" message={errorMessage} /> : null}
          {successMessage ? (
            <Alert type="success" message={successMessage} />
          ) : null}

          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 px-5 py-12 text-center text-sm text-slate-500">
              Votre panier est vide.
            </div>
          ) : (
            cartPricing.items.map(({ item, pricing }) => (
              <article
                key={item.product.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-950">
                      {item.product.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {pricing.isWholesale ? 'Prix de gros' : 'Prix de détail'}
                    </p>
                  </div>
                  {step === 'CART' ? (
                    <button
                      type="button"
                      onClick={() => removeItem(item.product.id)}
                      className="text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      Supprimer
                    </button>
                  ) : null}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <label className="text-sm font-medium text-slate-700">
                    Quantité
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      disabled={step !== 'CART'}
                      onChange={(event) =>
                        handleQuantityChange(
                          item.product.id,
                          item.wholesale,
                          event,
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-100"
                    />
                  </label>
                  <label className="flex items-center gap-2 self-end rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={item.wholesale}
                      disabled={step !== 'CART'}
                      onChange={(event) =>
                        updateItem(
                          item.product.id,
                          item.quantity,
                          event.target.checked,
                        )
                      }
                    />
                    Demande prix de gros
                  </label>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Prix unitaire
                    </p>
                    {pricing.promotionalQuantity > 0 &&
                    pricing.standardQuantity > 0 ? (
                      <div className="mt-1 space-y-1 text-xs text-slate-600">
                        <p>
                          {pricing.promotionalQuantity} x promotion :{' '}
                          <strong>
                            {formatPrice(pricing.promotionalUnitPrice)}
                          </strong>
                        </p>
                        <p>
                          {pricing.standardQuantity} x normal :{' '}
                          <strong>
                            {formatPrice(pricing.standardUnitPrice)}
                          </strong>
                        </p>
                      </div>
                    ) : (
                      <p className="mt-1 font-bold text-slate-900">
                        {formatPrice(
                          pricing.promotionalQuantity > 0
                            ? pricing.promotionalUnitPrice
                            : pricing.standardUnitPrice,
                        )}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-500">
                      Sous-total
                    </p>
                    <p className="mt-1 text-lg font-bold text-teal-800">
                      {formatPrice(pricing.subtotal)}
                    </p>
                  </div>
                </div>
              </article>
            ))
          )}

          {items.length > 0 ? (
            <div className="space-y-4 border-t border-slate-200 pt-5">
              <div className="flex items-center justify-between rounded-xl bg-teal-50 px-4 py-4">
                <p className="font-semibold text-teal-900">Total du panier</p>
                <p className="text-xl font-bold text-teal-900">
                  {formatPrice(cartPricing.total)}
                </p>
              </div>

              {step === 'CART' ? (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('')
                    setSuccessMessage('')
                    setStep('CHOICE')
                  }}
                  className="w-full rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800"
                >
                  Valider le panier
                </button>
              ) : null}

              {step === 'CHOICE' && requiresAdminApproval ? (
                <div className="space-y-4">
                  <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
                    Une demande utilisant le prix de gros doit être validée par
                    un administrateur avant son paiement.
                  </p>
                  <button
                    type="button"
                    onClick={() => void sendApprovalRequest()}
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-amber-950 hover:bg-amber-400 disabled:opacity-60"
                  >
                    {isSubmitting
                      ? 'Envoi...'
                      : 'Envoyer la demande vers un ADMIN'}
                  </button>
                </div>
              ) : null}

              {step === 'CHOICE' && !requiresAdminApproval ? (
                <div className="space-y-4">
                  <h3 className="text-center text-lg font-bold text-slate-950">
                    Voulez-vous générer une facture pour ce panier ?
                  </h3>
                  <PaymentMethodSelect
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                    disabled={isSubmitting}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setStep('INVOICE')}
                      disabled={isSubmitting}
                      className="rounded-lg border border-teal-600 px-4 py-3 font-semibold text-teal-700 hover:bg-teal-50"
                    >
                      Oui
                    </button>
                    <button
                      type="button"
                      onClick={() => void completeSale(false)}
                      disabled={isSubmitting}
                      className="rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800 disabled:bg-teal-300"
                    >
                      {isSubmitting
                        ? 'Traitement...'
                        : 'Non et marquer payé'}
                    </button>
                  </div>
                </div>
              ) : null}

              {step === 'INVOICE' ? (
                <form
                  className="space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void completeSale(true)
                  }}
                >
                  <h3 className="font-bold text-slate-950">
                    Informations client
                  </h3>
                  <input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Nom du client *"
                    required
                    className="w-full rounded-lg border border-slate-200 px-4 py-3"
                  />
                  <input
                    value={customerContact}
                    onChange={(event) => setCustomerContact(event.target.value)}
                    placeholder="Contact (optionnel)"
                    className="w-full rounded-lg border border-slate-200 px-4 py-3"
                  />
                  <input
                    value={customerAddress}
                    onChange={(event) => setCustomerAddress(event.target.value)}
                    placeholder="Adresse (optionnelle)"
                    className="w-full rounded-lg border border-slate-200 px-4 py-3"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      value={customerNif}
                      onChange={(event) => setCustomerNif(event.target.value)}
                      placeholder="NIF (optionnel)"
                      aria-label="NIF du client"
                      className="w-full rounded-lg border border-slate-200 px-4 py-3"
                    />
                    <input
                      value={customerStat}
                      onChange={(event) => setCustomerStat(event.target.value)}
                      placeholder="STAT (optionnel)"
                      aria-label="STAT du client"
                      className="w-full rounded-lg border border-slate-200 px-4 py-3"
                    />
                  </div>
                  <PaymentMethodSelect
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800 disabled:bg-teal-300"
                  >
                    {isSubmitting ? 'Traitement...' : 'Marquer payé'}
                  </button>
                </form>
              ) : null}

              {step !== 'CART' ? (
                <button
                  type="button"
                  onClick={() =>
                    setStep(step === 'INVOICE' ? 'CHOICE' : 'CART')
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Retour
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function PaymentMethodSelect({
  value,
  onChange,
  disabled,
}: {
  value: PaymentMethod
  onChange: (value: PaymentMethod) => void
  disabled: boolean
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      Moyen de paiement
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as PaymentMethod)}
        disabled={disabled}
        className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3"
      >
        {PAYMENT_METHOD_OPTIONS.map((method) => (
          <option key={method.value} value={method.value}>
            {method.label}
          </option>
        ))}
      </select>
    </label>
  )
}
