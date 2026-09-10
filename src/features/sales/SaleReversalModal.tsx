import { useState, type FormEvent } from 'react'
import { Alert } from '../../components/Alert'
import { InventoryModal } from '../inventories/InventoryModal'
import {
  cancelSale,
  refundSale,
  type RefundSaleItemPayload,
  type Sale,
  type SaleDetail,
} from './salesApi'

export type SaleReversalKind = 'REFUND' | 'CANCEL'

interface SaleReversalModalProps {
  sale: Sale
  kind: SaleReversalKind
  onClose: () => void
  onCompleted: (sale: Sale) => Promise<void>
}

interface RefundLineValues {
  isSelected: boolean
  quantity: string
  reason: string
}

function refundableQuantity(detail: SaleDetail): number {
  return detail.quantity + (detail.freeQuantity ?? 0) - detail.refundedQuantity
}

function initialRefundLines(sale: Sale): Record<number, RefundLineValues> {
  return sale.cartDetails.reduce<Record<number, RefundLineValues>>(
    (lines, detail) => ({
      ...lines,
      [detail.id]: {
        isSelected: false,
        quantity: '',
        reason: '',
      },
    }),
    {},
  )
}

export function SaleReversalModal({
  sale,
  kind,
  onClose,
  onCompleted,
}: SaleReversalModalProps) {
  const [reason, setReason] = useState<string>('')
  const [refundLines, setRefundLines] = useState<Record<number, RefundLineValues>>(
    () => initialRefundLines(sale),
  )
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const isRefund = kind === 'REFUND'

  function updateRefundLine(
    detailId: number,
    update: Partial<RefundLineValues>,
  ): void {
    setRefundLines((currentLines) => ({
      ...currentLines,
      [detailId]: {
        ...currentLines[detailId],
        ...update,
      },
    }))
    setErrorMessage('')
  }

  function fillAllRefunds(): void {
    setRefundLines((currentLines) =>
      sale.cartDetails.reduce<Record<number, RefundLineValues>>(
        (nextLines, detail) => ({
          ...nextLines,
          [detail.id]: {
            ...currentLines[detail.id],
            isSelected: refundableQuantity(detail) > 0,
            quantity: String(Math.max(refundableQuantity(detail), 0)),
          },
        }),
        {},
      ),
    )
    setErrorMessage('')
  }

  function buildRefundPayload(): RefundSaleItemPayload[] | null {
    const items: RefundSaleItemPayload[] = []

    for (const detail of sale.cartDetails) {
      const line = refundLines[detail.id]

      if (!line?.isSelected) {
        continue
      }

      const quantity = Number(line.quantity)
      const maxQuantity = refundableQuantity(detail)

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0 ||
        quantity > maxQuantity ||
        !line.reason.trim()
      ) {
        return null
      }

      items.push({
        cartDetailId: detail.id,
        quantity,
        reason: line.reason.trim(),
      })
    }

    return items.length > 0 ? items : null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    if (isRefund) {
      const items = buildRefundPayload()

      if (!items) {
        setErrorMessage(
          'Sélectionnez au moins un produit, puis renseignez une quantité valide et sa raison.',
        )
        return
      }

      await submitAction(() => refundSale(sale.id, items))
      return
    }

    const trimmedReason = reason.trim()

    if (!trimmedReason) {
      setErrorMessage("La raison de l'annulation est obligatoire.")
      return
    }

    await submitAction(() => cancelSale(sale.id, trimmedReason))
  }

  async function submitAction(action: () => Promise<Sale>): Promise<void> {
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const updatedSale = await action()
      await onCompleted(updatedSale)
      onClose()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible d'effectuer cette action.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <InventoryModal
      title={`${isRefund ? 'Rembourser la vente' : 'Annuler la vente'} n°${sale.id}`}
      onClose={isSubmitting ? () => undefined : onClose}
      size={isRefund ? 'xl' : 'sm'}
    >
      <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
        {errorMessage ? <Alert type="error" message={errorMessage} /> : null}
        {isRefund ? (
          <>
            <p className="text-sm text-slate-600">
              Sélectionnez les produits à rembourser. Le remboursement est
              possible dans les 24 heures et les produits ne retourneront pas
              dans le stock.
            </p>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
                {sale.cartDetails.map((detail) => {
                  const line = refundLines[detail.id]
                  const maxQuantity = refundableQuantity(detail)
                  const isUnavailable = maxQuantity <= 0

                  return (
                    <article
                      key={detail.id}
                      className="space-y-3 p-4 even:bg-slate-50"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <label className="flex min-w-0 items-center gap-3 font-semibold text-slate-900">
                          <input
                            type="checkbox"
                            checked={line?.isSelected ?? false}
                            disabled={isUnavailable || isSubmitting}
                            onChange={(event) =>
                              updateRefundLine(detail.id, {
                                isSelected: event.target.checked,
                              })
                            }
                            className="h-4 w-4 accent-teal-700"
                          />
                          <span>
                            {detail.product.name}
                            <span className="ml-2 text-xs font-normal text-slate-500">
                              Réf. {detail.product.reference}
                            </span>
                          </span>
                        </label>
                        <span className="text-sm text-slate-600">
                          {isUnavailable
                            ? 'Déjà remboursé'
                            : `${maxQuantity} unité(s) remboursable(s)`}
                        </span>
                      </div>
                      {line?.isSelected ? (
                        <div className="grid gap-3 sm:grid-cols-[9rem_minmax(0,1fr)]">
                          <label className="text-sm font-medium text-slate-700">
                            Quantité
                            <input
                              type="number"
                              min="1"
                              max={maxQuantity}
                              step="1"
                              value={line.quantity}
                              disabled={isSubmitting}
                              onChange={(event) =>
                                updateRefundLine(detail.id, {
                                  quantity: event.target.value,
                                })
                              }
                              className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                            />
                          </label>
                          <label className="text-sm font-medium text-slate-700">
                            Raison
                            <input
                              value={line.reason}
                              disabled={isSubmitting}
                              onChange={(event) =>
                                updateRefundLine(detail.id, {
                                  reason: event.target.value,
                                })
                              }
                              placeholder="Produit défectueux, erreur de vente…"
                              className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                            />
                          </label>
                        </div>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={fillAllRefunds}
              disabled={isSubmitting}
              className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-60"
            >
              Tout rembourser
            </button>
          </>
        ) : (
          <label className="block text-sm font-medium text-slate-700">
            Raison de l’annulation *
            <textarea
              value={reason}
              onChange={(event) => {
                setReason(event.target.value)
                setErrorMessage('')
              }}
              required
              rows={4}
              disabled={isSubmitting}
              className="mt-2 block w-full resize-y rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-100"
            />
          </label>
        )}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-200 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            Retour
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`rounded-lg px-4 py-3 font-semibold text-white disabled:opacity-60 ${
              isRefund
                ? 'bg-violet-700 hover:bg-violet-800'
                : 'bg-red-700 hover:bg-red-800'
            }`}
          >
            {isSubmitting
              ? 'Traitement...'
              : isRefund
                ? 'Valider le remboursement'
                : 'Confirmer l’annulation'}
          </button>
        </div>
      </form>
    </InventoryModal>
  )
}
