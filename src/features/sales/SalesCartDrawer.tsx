import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Alert } from '../../components/Alert'
import {
  createSale,
  paySale,
  PAYMENT_METHOD_OPTIONS,
  type PaymentMethod,
} from './salesApi'
import { useSalesCart } from './salesCart'

interface SalesCartDrawerProps {
  onClose: () => void
}

export function SalesCartDrawer({ onClose }: SalesCartDrawerProps) {
  const { items, updateItem, removeItem, clearCart } = useSalesCart()
  const [customerName, setCustomerName] = useState<string>('')
  const [customerContact, setCustomerContact] = useState<string>('')
  const [customerAddress, setCustomerAddress] = useState<string>('')
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('CASH')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const sale = await createSale({
        customerName,
        customerContact,
        customerAddress,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          wholesale: item.wholesale,
        })),
      })

      if (sale.status === 'VALIDATED') {
        try {
          await paySale(sale.id, paymentMethod)
          setSuccessMessage(`Vente n°${sale.id} payée avec succès.`)
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? `${error.message} La vente n°${sale.id} reste disponible dans les ventes à payer.`
              : `La vente n°${sale.id} reste disponible dans les ventes à payer.`,
          )
        }
      } else {
        setSuccessMessage(
          `Vente n°${sale.id} envoyée pour validation administrative.`,
        )
      }

      clearCart()
      setCustomerName('')
      setCustomerContact('')
      setCustomerAddress('')
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
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
            items.map((item) => (
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
                      {item.quantity > 3 || item.wholesale
                        ? 'Prix de gros'
                        : 'Prix de détail'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.product.id)}
                    className="text-sm font-semibold text-red-600 hover:text-red-700"
                  >
                    Supprimer
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <label className="text-sm font-medium text-slate-700">
                    Quantité
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) =>
                        handleQuantityChange(
                          item.product.id,
                          item.wholesale,
                          event,
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </label>
                  <label className="flex items-center gap-2 self-end rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={item.wholesale}
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
              </article>
            ))
          )}

          {items.length > 0 ? (
            <form className="space-y-4 border-t border-slate-200 pt-5" onSubmit={handleSubmit}>
              <h3 className="font-bold text-slate-950">Informations client</h3>
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Nom du client"
                required
                className="w-full rounded-lg border border-slate-200 px-4 py-3"
              />
              <input
                value={customerContact}
                onChange={(event) => setCustomerContact(event.target.value)}
                placeholder="Contact"
                required
                className="w-full rounded-lg border border-slate-200 px-4 py-3"
              />
              <input
                value={customerAddress}
                onChange={(event) => setCustomerAddress(event.target.value)}
                placeholder="Adresse"
                required
                className="w-full rounded-lg border border-slate-200 px-4 py-3"
              />
              <label className="block text-sm font-medium text-slate-700">
                Moyen de paiement
                <select
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value as PaymentMethod)
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3"
                >
                  {PAYMENT_METHOD_OPTIONS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800 disabled:bg-teal-300"
              >
                {isSubmitting ? 'Traitement...' : 'Confirmer la vente'}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  )
}
