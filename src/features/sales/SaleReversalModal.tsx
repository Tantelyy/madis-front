import { useState, type FormEvent } from 'react'
import { Alert } from '../../components/Alert'
import { InventoryModal } from '../inventories/InventoryModal'
import { cancelSale, refundSale, type Sale } from './salesApi'

export type SaleReversalKind = 'REFUND' | 'CANCEL'

interface SaleReversalModalProps {
  sale: Sale
  kind: SaleReversalKind
  onClose: () => void
  onCompleted: (sale: Sale) => Promise<void>
}

const REVERSAL_CONTENT: Readonly<
  Record<
    SaleReversalKind,
    {
      title: string
      description: string
      reasonLabel: string
      confirmLabel: string
    }
  >
> = {
  REFUND: {
    title: 'Rembourser la vente',
    description:
      'Le stock correspondant sera restauré et la vente sera marquée remboursée.',
    reasonLabel: 'Raison du remboursement',
    confirmLabel: 'Confirmer le remboursement',
  },
  CANCEL: {
    title: 'Annuler la vente',
    description:
      'Le stock correspondant sera restauré et la vente sera marquée annulée.',
    reasonLabel: "Raison de l'annulation",
    confirmLabel: "Confirmer l'annulation",
  },
}

export function SaleReversalModal({
  sale,
  kind,
  onClose,
  onCompleted,
}: SaleReversalModalProps) {
  const [reason, setReason] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const content = REVERSAL_CONTENT[kind]

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const trimmedReason = reason.trim()

    if (!trimmedReason) {
      setErrorMessage('La raison est obligatoire.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const updatedSale =
        kind === 'REFUND'
          ? await refundSale(sale.id, trimmedReason)
          : await cancelSale(sale.id, trimmedReason)
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
      title={`${content.title} n°${sale.id}`}
      onClose={isSubmitting ? () => undefined : onClose}
      size="sm"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {errorMessage ? <Alert type="error" message={errorMessage} /> : null}
        <p className="text-sm text-slate-600">{content.description}</p>
        <label className="block text-sm font-medium text-slate-700">
          {content.reasonLabel} *
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
              kind === 'REFUND'
                ? 'bg-violet-700 hover:bg-violet-800'
                : 'bg-red-700 hover:bg-red-800'
            }`}
          >
            {isSubmitting ? 'Traitement...' : content.confirmLabel}
          </button>
        </div>
      </form>
    </InventoryModal>
  )
}
