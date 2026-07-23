import { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AuthenticatedUser } from '../auth/authApi'
import { Alert } from '../components/Alert'
import { Pagination } from '../components/Pagination'
import { InventoryModal } from '../features/inventories/InventoryModal'
import { SaleDetails } from '../features/sales/SaleDetails'
import { SaleListTable } from '../features/sales/SaleListTable'
import {
  SaleReversalModal,
  type SaleReversalKind,
} from '../features/sales/SaleReversalModal'
import {
  type CartStatus,
  type Sale,
} from '../features/sales/salesApi'
import { useSalesList } from '../features/sales/useSalesList'

const PAGE_SIZE = 10
interface ReversalState {
  sale: Sale
  kind: SaleReversalKind
}

export function SalesHistoryPage({ user }: { user: AuthenticatedUser }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState<CartStatus | undefined>(undefined)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [reversalState, setReversalState] = useState<ReversalState | null>(null)
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
    refresh,
  } = useSalesList(status, PAGE_SIZE)

  function handleSearch(event: ChangeEvent<HTMLInputElement>): void {
    setIsLoading(true)
    setSearch(event.target.value)
    setPage(1)
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Ventes
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Historique des ventes
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {user.role === 'ADMIN'
              ? 'Toutes les ventes enregistrées dans le système.'
              : 'Vos ventes enregistrées dans le système.'}
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

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_16rem]">
        <input
          type="search"
          value={search}
          onChange={handleSearch}
          aria-label="Rechercher une vente"
          placeholder="Client, contact ou vendeur"
          className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
        />
        <select
          value={status ?? ''}
          onChange={(event) => {
            setIsLoading(true)
            setStatus((event.target.value || undefined) as
              | CartStatus
              | undefined)
            setPage(1)
          }}
          aria-label="Filtrer par statut"
          className="rounded-lg border border-slate-200 px-4 py-3"
        >
          <option value="">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="VALIDATED">Validée</option>
          <option value="PAID">Payée</option>
          <option value="REFUNDED">Remboursée</option>
          <option value="CANCELLED">Annulée</option>
        </select>
      </div>

      <SaleListTable
        sales={sales}
        isLoading={isLoading}
        onSelect={setSelectedSale}
        renderActions={(sale) => {
          if (sale.status === 'PAID') {
            return (
              <button
                type="button"
                onClick={() => {
                  setSuccessMessage('')
                  setReversalState({ sale, kind: 'REFUND' })
                }}
                className="rounded-lg border border-violet-200 px-3 py-2 font-semibold text-violet-700 hover:bg-violet-50"
              >
                Rembourser
              </button>
            )
          }

          if (sale.status === 'VALIDATED') {
            return (
              <button
                type="button"
                onClick={() => {
                  setSuccessMessage('')
                  setReversalState({ sale, kind: 'CANCEL' })
                }}
                className="rounded-lg border border-red-200 px-3 py-2 font-semibold text-red-700 hover:bg-red-50"
              >
                Annuler
              </button>
            )
          }

          return null
        }}
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

      {reversalState ? (
        <SaleReversalModal
          sale={reversalState.sale}
          kind={reversalState.kind}
          onClose={() => setReversalState(null)}
          onCompleted={async (sale) => {
            setSuccessMessage(
              sale.status === 'REFUNDED'
                ? `Vente n°${sale.id} remboursée avec succès.`
                : `Vente n°${sale.id} annulée avec succès.`,
            )
            await refresh()
          }}
        />
      ) : null}
    </section>
  )
}
