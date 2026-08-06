import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { Pagination } from '../components/Pagination'
import { TabularExportButton } from '../components/TabularExportButton'
import { InventoryMovementsTable } from '../features/inventories/InventoryMovementsTable'
import {
  formatMovementType,
  formatPrice,
  formatRoundedPrice,
  INVENTORY_MOVEMENT_TYPE_OPTIONS,
} from '../features/inventories/inventoryFormatters'
import {
  listAllInventoryMovements,
  listInventoryMovements,
  type InventoryMovement,
  type InventoryMovementType,
  type PaginatedInventoryMovements,
} from '../features/inventories/inventoriesApi'
import {
  createPaginationMeta,
  normalizePaginationMeta,
} from '../utils/paginationMeta'
import { formatDateTime, formatUser } from '../utils/displayFormatters'
import { formatPdfAriary, type ExportColumn } from '../utils/tabularExport'

const PAGE_SIZE = 10

const MOVEMENT_EXPORT_COLUMNS: readonly ExportColumn<InventoryMovement>[] = [
  {
    header: 'Date',
    value: (movement) => formatDateTime(movement.createdAt),
    width: 2,
  },
  {
    header: 'Type',
    value: (movement) => formatMovementType(movement.type),
    width: 2,
  },
  {
    header: 'Produit',
    value: (movement) =>
      movement.inventory?.product?.name ?? `Stock #${movement.inventoryId}`,
    width: 3,
  },
  {
    header: 'Référence',
    value: (movement) => movement.inventory?.product?.reference ?? '-',
    width: 2,
  },
  {
    header: 'Fournisseur',
    value: (movement) => movement.inventory?.supplier?.name ?? '-',
    width: 2,
  },
  {
    header: 'Entrée',
    value: (movement) => movement.incomingQuantity,
    width: 1,
  },
  {
    header: 'Sortie',
    value: (movement) => movement.outgoingQuantity,
    width: 1,
  },
  {
    header: 'Prix achat (Ariary)',
    value: (movement) => formatPrice(movement.purchasePrice),
    pdfValue: (movement) => formatPdfAriary(movement.purchasePrice),
    width: 2,
  },
  {
    header: 'Prix détail (Ariary)',
    value: (movement) => formatRoundedPrice(movement.salePrice),
    pdfValue: (movement) => formatPdfAriary(movement.salePrice),
    width: 2,
  },
  {
    header: 'Prix gros (Ariary)',
    value: (movement) => formatRoundedPrice(movement.wholesalePrice),
    pdfValue: (movement) => formatPdfAriary(movement.wholesalePrice),
    width: 2,
  },
  {
    header: 'Acteur',
    value: (movement) => formatUser(movement.actor),
    width: 2,
  },
]

export function InventoryMovementsPage() {
  const [searchParams] = useSearchParams()
  const inventoryIdParam = searchParams.get('inventoryId')
  const inventoryId = inventoryIdParam ? Number(inventoryIdParam) : undefined
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [meta, setMeta] = useState<PaginatedInventoryMovements['meta']>(() =>
    createPaginationMeta(PAGE_SIZE),
  )
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState<string>('')
  const [type, setType] = useState<InventoryMovementType | ''>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const fetchMovements =
    useCallback((): Promise<PaginatedInventoryMovements> => {
      return listInventoryMovements({
        page,
        limit: PAGE_SIZE,
        search,
        type: type || undefined,
        inventoryId,
      })
    }, [inventoryId, page, search, type])

  function applyMovementsResponse(response: PaginatedInventoryMovements): void {
    setMovements(response.data)
    setMeta(normalizePaginationMeta(response.meta))
  }

  useEffect(() => {
    let isActive = true

    async function loadMovements(): Promise<void> {
      setIsLoading(true)

      try {
        const response = await fetchMovements()

        if (!isActive) {
          return
        }

        applyMovementsResponse(response)
      } catch (error) {
        if (!isActive) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Impossible de charger l'historique.",
        )
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadMovements()

    return () => {
      isActive = false
    }
  }, [fetchMovements])

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>): void {
    setSearch(event.target.value)
    setPage(1)
  }

  function handleTypeChange(event: ChangeEvent<HTMLSelectElement>): void {
    setType(event.target.value as InventoryMovementType | '')
    setPage(1)
  }

  function handlePageChange(nextPage: number): void {
    setPage(nextPage)
  }

  return (
    <section className="flex min-h-[calc(100vh-7rem)] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Stock
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Historique des stocks
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <TabularExportButton
            currentRows={movements}
            columns={MOVEMENT_EXPORT_COLUMNS}
            title="Mouvements de stock"
            fileNamePrefix="mouvements-stock"
            isLoading={isLoading}
            loadAllRows={() =>
              listAllInventoryMovements({
                search,
                type: type || undefined,
                inventoryId,
              })
            }
          />
          <Link
            to="/inventories"
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50"
          >
            Retour au stock
          </Link>
        </div>
      </div>

      {errorMessage ? <Alert type="error" message={errorMessage} /> : null}

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div>
          <label
            htmlFor="inventory-movement-search"
            className="block text-sm font-medium text-slate-700"
          >
            Rechercher dans l'historique
          </label>
          <input
            id="inventory-movement-search"
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Produit, référence, fournisseur ou utilisateur"
            className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          />
        </div>
        <div>
          <label
            htmlFor="inventory-movement-type"
            className="block text-sm font-medium text-slate-700"
          >
            Type de mouvement
          </label>
          <select
            id="inventory-movement-type"
            value={type}
            onChange={handleTypeChange}
            className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          >
            <option value="">Tous les types</option>
            {INVENTORY_MOVEMENT_TYPE_OPTIONS.map((movementType) => (
              <option key={movementType.value} value={movementType.value}>
                {movementType.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <InventoryMovementsTable movements={movements} isLoading={isLoading} />

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
