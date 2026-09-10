import { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { Pagination } from '../components/Pagination'
import { InventoryModal } from '../features/inventories/InventoryModal'
import { InvoiceDownloadButton } from '../features/sales/InvoiceDownloadButton'
import { SaleDetails } from '../features/sales/SaleDetails'
import { SaleListTable } from '../features/sales/SaleListTable'
import {
  paySale,
  type PaymentMethod,
  type Sale,
} from '../features/sales/salesApi'
import { PAYMENT_METHOD_OPTIONS } from '../features/sales/paymentMethods'
import { useSalesList } from '../features/sales/useSalesList'

const PAGE_SIZE = 10

export function SellerApprovedSalesPage() {
  const navigate = useNavigate()
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [saleToPay, setSaleToPay] = useState<Sale | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [isPaying, setIsPaying] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const {
    sales,
    meta,
    search,
    isLoading,
    errorMessage,
    setPage,
    setSearch,
    setIsLoading,
    setErrorMessage,
    refresh,
  } = useSalesList(undefined, PAGE_SIZE, true)

  function handleSearch(event: ChangeEvent<HTMLInputElement>): void {
    setIsLoading(true)
    setSearch(event.target.value)
    setPage(1)
  }

  async function handlePay(): Promise<void> {
    if (!saleToPay) {
      return
    }

    setIsPaying(true)
    setErrorMessage('')

    try {
      await paySale(saleToPay.id, paymentMethod)
      setSuccessMessage(`Vente n°${saleToPay.id} marquée payée.`)
      setSaleToPay(null)
      await refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible de marquer la vente payée.',
      )
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
            Prix de gros
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Ventes validées par ADMIN
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Suivez vos demandes en attente et finalisez celles validées par un
            administrateur.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/sales')}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-teal-700 hover:bg-teal-50"
        >
          Retour à la vente
        </button>
      </div>

      {errorMessage ? <Alert type="error" message={errorMessage} /> : null}
      {successMessage ? <Alert type="success" message={successMessage} /> : null}

      <input
        type="search"
        value={search}
        onChange={handleSearch}
        aria-label="Rechercher une demande de prix de gros"
        placeholder="Client ou vendeur"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
      />

      <SaleListTable
        sales={sales}
        isLoading={isLoading}
        onSelect={setSelectedSale}
        renderActions={(sale) =>
          sale.status === 'VALIDATED' ? (
            <>
              <InvoiceDownloadButton sale={sale} />
              <button
                type="button"
                onClick={() => setSaleToPay(sale)}
                className="rounded-lg bg-teal-700 px-3 py-2 font-semibold text-white hover:bg-teal-800"
              >
                Marquer payé
              </button>
            </>
          ) : null
        }
      />

      {meta.totalPages > 1 ? (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          onPageChange={(nextPage) => {
            setIsLoading(true)
            setPage(nextPage)
          }}
        />
      ) : null}

      {selectedSale ? (
        <InventoryModal
          title={`Détail de la vente n°${selectedSale.id}`}
          onClose={() => setSelectedSale(null)}
          size="xl"
        >
          <SaleDetails sale={selectedSale} />
        </InventoryModal>
      ) : null}

      {saleToPay ? (
        <InventoryModal
          title={`Paiement de la vente n°${saleToPay.id}`}
          onClose={() => setSaleToPay(null)}
          errorMessage={errorMessage}
        >
          <div className="space-y-5">
            <p className="text-sm text-slate-600">
              La vente a été validée par un administrateur. Sélectionnez le
              moyen de paiement reçu.
            </p>
            <label className="block text-sm font-medium text-slate-700">
              Moyen de paiement
              <select
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value as PaymentMethod)
                }
                disabled={isPaying}
                className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3"
              >
                {PAYMENT_METHOD_OPTIONS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSaleToPay(null)}
                disabled={isPaying}
                className="rounded-lg border border-slate-200 px-4 py-3 font-semibold text-slate-600"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void handlePay()}
                disabled={isPaying}
                className="rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800 disabled:bg-teal-300"
              >
                {isPaying ? 'Traitement...' : 'Confirmer le paiement'}
              </button>
            </div>
          </div>
        </InventoryModal>
      ) : null}
    </section>
  )
}
