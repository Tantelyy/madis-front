import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { Alert } from '../components/Alert'
import { Pagination } from '../components/Pagination'
import { TabularExportButton } from '../components/TabularExportButton'
import { StockSummaryTable } from '../features/stocks/StockSummaryTable'
import {
  listAllStockSummary,
  listStockSummary,
  createStockLimit,
  getStockLimit,
  type ListStockSummaryParams,
  type PaginatedStockSummary,
  type StockSummary,
} from '../features/stocks/stockApi'
import { useListControls } from '../hooks/useListControls'
import {
  createPaginationMeta,
  normalizePaginationMeta,
} from '../utils/paginationMeta'
import type { ExportColumn } from '../utils/tabularExport'

const PAGE_SIZE = 10

type StockSortField = NonNullable<ListStockSummaryParams['sortBy']>

const STOCK_EXPORT_COLUMNS: readonly ExportColumn<StockSummary>[] = [
  { header: 'Nom du produit', value: (product) => product.name, width: 3 },
  { header: 'Référence', value: (product) => product.reference, width: 2 },
  {
    header: 'Quantité restante',
    value: (product) => product.remainingQuantity,
    width: 1,
  },
]

export function StockStatusPage() {
  const [products, setProducts] = useState<StockSummary[]>([])
  const [meta, setMeta] = useState<PaginatedStockSummary['meta']>(() =>
    createPaginationMeta(PAGE_SIZE),
  )
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSavingLimit, setIsSavingLimit] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [expiresBefore, setExpiresBefore] = useState<string>('')
  const [stockLimit, setStockLimit] = useState<number>(15)
  const [limitDraft, setLimitDraft] = useState<string>('15')
  const {
    page,
    setPage,
    search,
    sortBy,
    sortOrder,
    handleSearchChange,
    handlePageChange,
    handleSort,
  } = useListControls<StockSortField>({
    initialSortBy: 'name',
    initialOrder: 'asc',
    onBeforeChange: () => setIsLoading(true),
  })

  const fetchProducts = useCallback((): Promise<PaginatedStockSummary> => {
    return listStockSummary({
      page,
      limit: PAGE_SIZE,
      search,
      expiresBefore: expiresBefore || undefined,
      sortBy,
      order: sortOrder,
    })
  }, [expiresBefore, page, search, sortBy, sortOrder])

  useEffect(() => {
    let isActive = true

    void getStockLimit()
      .then((limit) => {
        if (isActive) {
          setStockLimit(limit.value)
          setLimitDraft(String(limit.value))
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Impossible de charger le seuil de stock.',
          )
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  function handleExpiresBeforeChange(event: ChangeEvent<HTMLInputElement>): void {
    setIsLoading(true)
    setExpiresBefore(event.target.value)
    setPage(1)
  }

  async function handleSaveStockLimit(): Promise<void> {
    const nextLimit = Number(limitDraft)

    if (!Number.isInteger(nextLimit) || nextLimit < 0) {
      setErrorMessage('Le seuil doit être un nombre entier positif ou nul.')
      return
    }

    setIsSavingLimit(true)
    setErrorMessage('')

    try {
      const savedLimit = await createStockLimit(nextLimit)
      setStockLimit(savedLimit.value)
      setLimitDraft(String(savedLimit.value))
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible de mettre à jour le seuil de stock.',
      )
    } finally {
      setIsSavingLimit(false)
    }
  }

  useEffect(() => {
    let isActive = true

    void fetchProducts()
      .then((response) => {
        if (isActive) {
          setProducts(response.data)
          setMeta(normalizePaginationMeta(response.meta))
          setErrorMessage('')
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Impossible de charger l’état du stock.',
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
  }, [fetchProducts])

  return (
    <section className="flex min-h-[calc(100vh-7rem)] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Stock
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            État de stock
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Quantités disponibles par produit et détail de chaque lot.
          </p>
        </div>
        <TabularExportButton
          currentRows={products}
          columns={STOCK_EXPORT_COLUMNS}
          title="État du stock"
          fileNamePrefix="etat-stock"
          isLoading={isLoading}
          loadAllRows={() =>
            listAllStockSummary({
              search,
              expiresBefore: expiresBefore || undefined,
              sortBy,
              order: sortOrder,
            })
          }
        />
      </div>

      {errorMessage ? <Alert type="error" message={errorMessage} /> : null}

      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <label
          htmlFor="stock-summary-search"
          className="block text-sm font-medium text-slate-700"
        >
          Rechercher un produit
          <input
          id="stock-summary-search"
          type="search"
          value={search}
          onChange={handleSearchChange}
          placeholder="Nom ou référence"
          className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 sm:w-64"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Expire avant le
          <input
            type="date"
            value={expiresBefore}
            onChange={handleExpiresBeforeChange}
            className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 sm:w-44"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Seuil minimum
          <span className="mt-2 flex gap-2">
            <input
              type="number"
              min="0"
              step="1"
              value={limitDraft}
              onChange={(event) => setLimitDraft(event.target.value)}
              className="block w-24 rounded-lg border border-slate-200 bg-white px-3 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
            <button
              type="button"
              onClick={() => void handleSaveStockLimit()}
              disabled={isSavingLimit || limitDraft === String(stockLimit)}
              className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-teal-300"
            >
              {isSavingLimit ? 'Enregistrement...' : 'Mettre à jour'}
            </button>
          </span>
        </label>
      </div>

      <StockSummaryTable
        products={products}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        dangerThreshold={stockLimit + 5}
      />

      {meta.totalPages > 1 ? (
        <div className="mt-auto">
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      ) : null}
    </section>
  )
}
