import { useState, type MouseEvent } from 'react'
import { Alert } from '../../components/Alert'
import { InventoryModal } from '../inventories/InventoryModal'
import { downloadSaleInvoice, type Sale } from './salesApi'

interface InvoiceDownloadButtonProps {
  sale: Sale
  className?: string
}

export function InvoiceDownloadButton({
  sale,
  className,
}: InvoiceDownloadButtonProps) {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false)
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const [customerName, setCustomerName] = useState<string>(
    sale.customerName ?? '',
  )
  const [customerContact, setCustomerContact] = useState<string>(
    sale.customerContact ?? '',
  )
  const [customerAddress, setCustomerAddress] = useState<string>(
    sale.customerAddress ?? '',
  )
  const [customerNif, setCustomerNif] = useState<string>(
    sale.customerNif ?? '',
  )
  const [customerStat, setCustomerStat] = useState<string>(
    sale.customerStat ?? '',
  )
  const [errorMessage, setErrorMessage] = useState<string>('')

  async function generateInvoice(): Promise<void> {
    setIsDownloading(true)
    setErrorMessage('')

    try {
      await downloadSaleInvoice(sale.id, {
        customerName,
        customerContact,
        customerAddress,
        customerNif,
        customerStat,
      })
      setIsFormOpen(false)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible de générer la facture.',
      )
    } finally {
      setIsDownloading(false)
    }
  }

  async function handleClick(
    event: MouseEvent<HTMLButtonElement>,
  ): Promise<void> {
    event.stopPropagation()

    setErrorMessage('')
    setIsFormOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={(event) => void handleClick(event)}
        disabled={isDownloading}
        className={
          className ??
          'rounded-lg border border-teal-200 px-3 py-2 font-semibold text-teal-700 hover:bg-teal-100 disabled:opacity-60'
        }
      >
        {isDownloading ? 'Génération...' : 'Générer la facture'}
      </button>

      {isFormOpen ? (
        <InventoryModal
          title={`Facture de la vente n°${sale.id}`}
          onClose={() => setIsFormOpen(false)}
        >
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              void generateInvoice()
            }}
          >
            {errorMessage ? <Alert type="error" message={errorMessage} /> : null}
            <p className="text-sm text-slate-600">
              Renseignez le client à faire apparaître sur la facture.
            </p>
            <label className="block text-sm font-medium text-slate-700">
              Nom du client *
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Contact
              <input
                value={customerContact}
                onChange={(event) => setCustomerContact(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Adresse
              <input
                value={customerAddress}
                onChange={(event) => setCustomerAddress(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                NIF
                <input
                  value={customerNif}
                  onChange={(event) => setCustomerNif(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                STAT
                <input
                  value={customerStat}
                  onChange={(event) => setCustomerStat(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3"
                />
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                disabled={isDownloading}
                className="rounded-lg border border-slate-200 px-4 py-3 font-semibold text-slate-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isDownloading}
                className="rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800 disabled:bg-teal-300"
              >
                {isDownloading ? 'Génération...' : 'Télécharger la facture'}
              </button>
            </div>
          </form>
        </InventoryModal>
      ) : null}
    </>
  )
}
