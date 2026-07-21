import { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { Pagination } from '../components/Pagination'
import { InventoryModal } from '../features/inventories/InventoryModal'
import { SaleDetails } from '../features/sales/SaleDetails'
import { SaleListTable } from '../features/sales/SaleListTable'
import {
  PAYMENT_METHOD_OPTIONS,
  validateSale,
  type PaymentMethod,
  type Sale,
} from '../features/sales/salesApi'
import { useSalesList } from '../features/sales/useSalesList'

const PAGE_SIZE = 10

export function PendingSalesPage() {
  const navigate = useNavigate()
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [isValidating, setIsValidating] = useState<boolean>(false)
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('CASH')
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
  } = useSalesList('PENDING', PAGE_SIZE)

  function handleSearch(event: ChangeEvent<HTMLInputElement>): void {
    setIsLoading(true)
    setSearch(event.target.value)
    setPage(1)
  }

  async function handleValidate(): Promise<void> {
    if (!selectedSale) {
      return
    }

    setIsValidating(true)
    setErrorMessage('')

    try {
      await validateSale(
        selectedSale.id,
        selectedSale.paymentMethod ?? paymentMethod,
      )
      setSuccessMessage(`Vente n°${selectedSale.id} validée et payée.`)
      setSelectedSale(null)
      await refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible de valider la vente.',
      )
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
            Validation administrative
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Ventes en attente de validation
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Cliquez sur une vente pour consulter toutes ses lignes avant validation.
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
        aria-label="Rechercher une vente en attente"
        placeholder="Client, contact ou vendeur"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
      />

      <SaleListTable
        sales={sales}
        isLoading={isLoading}
        onSelect={setSelectedSale}
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
          title={`Vente en attente n°${selectedSale.id}`}
          onClose={() => setSelectedSale(null)}
          size="xl"
        >
          <SaleDetails
            sale={selectedSale}
            actions={
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                {selectedSale.paymentMethod === null ? (
                  <label className="text-sm font-medium text-slate-700">
                    Moyen de paiement
                    <select
                      value={paymentMethod}
                      onChange={(event) =>
                        setPaymentMethod(event.target.value as PaymentMethod)
                      }
                      disabled={isValidating}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 sm:w-56"
                    >
                      {PAYMENT_METHOD_OPTIONS.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleValidate()}
                  disabled={isValidating}
                  className="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 disabled:bg-teal-300"
                >
                  {isValidating
                    ? 'Validation...'
                    : 'Valider et marquer payée'}
                </button>
              </div>
            }
          />
        </InventoryModal>
      ) : null}
    </section>
  )
}
