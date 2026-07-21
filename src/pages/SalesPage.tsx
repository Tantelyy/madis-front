import { useEffect, useState, type ChangeEvent } from 'react'
import type { AuthenticatedUser } from '../auth/authApi'
import { Alert } from '../components/Alert'
import { Pagination } from '../components/Pagination'
import { InventoryModal } from '../features/inventories/InventoryModal'
import { SaleProductCard } from '../features/sales/SaleProductCard'
import {
  listSaleCatalog,
  listSales,
  validateSale,
  type PaginatedSaleCatalog,
  type Sale,
  type SaleCatalogProduct,
} from '../features/sales/salesApi'
import { formatDateTime, formatPrice } from '../utils/displayFormatters'
import { createPaginationMeta } from '../utils/paginationMeta'

const PAGE_SIZE = 12
const QUEUE_SIZE = 50

export function SalesPage({ user }: { user: AuthenticatedUser }) {
  const [products, setProducts] = useState<SaleCatalogProduct[]>([])
  const [meta, setMeta] = useState<PaginatedSaleCatalog['meta']>(() =>
    createPaginationMeta(PAGE_SIZE),
  )
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [isPendingQueueOpen, setIsPendingQueueOpen] = useState<boolean>(false)
  const [queueSales, setQueueSales] = useState<Sale[]>([])
  const [isQueueLoading, setIsQueueLoading] = useState<boolean>(false)

  useEffect(() => {
    let isActive = true

    void listSaleCatalog({
        page,
        limit: PAGE_SIZE,
        search,
      })
      .then((response) => {
        if (isActive) {
          setProducts(response.data)
          setMeta(response.meta)
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Impossible de charger le catalogue.',
          )
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [page, search])

  async function openPendingQueue(): Promise<void> {
    setIsPendingQueueOpen(true)
    setIsQueueLoading(true)
    setErrorMessage('')

    try {
      const response = await listSales({
        page: 1,
        limit: QUEUE_SIZE,
        status: 'PENDING',
      })
      setQueueSales(response.data)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Impossible de charger les ventes.',
      )
    } finally {
      setIsQueueLoading(false)
    }
  }

  async function handleValidate(saleId: number): Promise<void> {
    try {
      await validateSale(saleId)
      setQueueSales((sales) => sales.filter((sale) => sale.id !== saleId))
      setSuccessMessage(`Vente n°${saleId} validée.`)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Impossible de valider la vente.',
      )
    }
  }

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>): void {
    setIsLoading(true)
    setSearch(event.target.value)
    setPage(1)
  }

  return (
    <section className="flex min-h-[calc(100vh-7rem)] flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Point de vente
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Vente</h1>
          <p className="mt-2 text-sm text-slate-500">
            Les lots en promotion sont proposés en premier, puis le stock est sorti en FIFO.
          </p>
        </div>
        {user.role === 'ADMIN' ? (
          <button
            type="button"
            onClick={() => void openPendingQueue()}
            className="rounded-lg bg-amber-500 px-4 py-3 text-sm font-bold text-amber-950 hover:bg-amber-400"
          >
            Ventes en attente de validation
          </button>
        ) : null}
      </div>

      {errorMessage ? <Alert type="error" message={errorMessage} /> : null}
      {successMessage ? <Alert type="success" message={successMessage} /> : null}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          id="sale-search"
          aria-label="Rechercher un produit"
          type="search"
          value={search}
          onChange={handleSearchChange}
          placeholder="Nom ou référence du produit"
          className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 sm:max-w-2xl"
        />
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-slate-500">
          Chargement du catalogue...
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-slate-500">
          Aucun produit trouvé.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {products.map((product) => (
            <SaleProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

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

      {isPendingQueueOpen ? (
        <InventoryModal
          title="Ventes en attente de validation"
          onClose={() => setIsPendingQueueOpen(false)}
          size="xl"
        >
          {isQueueLoading ? (
            <p className="py-8 text-center text-slate-500">Chargement...</p>
          ) : queueSales.length === 0 ? (
            <p className="py-8 text-center text-slate-500">Aucune vente.</p>
          ) : (
            <div className="space-y-3">
              {queueSales.map((sale) => (
                <article
                  key={sale.id}
                  className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-950">
                      Vente n°{sale.id} · {sale.customerName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDateTime(sale.createdAt)} · {formatPrice(sale.totalPrice)} · {sale.seller?.userName ?? '-'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleValidate(sale.id)}
                    className="rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    Valider
                  </button>
                </article>
              ))}
            </div>
          )}
        </InventoryModal>
      ) : null}
    </section>
  )
}
