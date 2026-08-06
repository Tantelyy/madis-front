import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { Pagination } from '../components/Pagination'
import { InventoryCsvImportButton } from '../features/inventories/InventoryCsvImportButton'
import { InventoryForm } from '../features/inventories/InventoryForm'
import { InventoryModal } from '../features/inventories/InventoryModal'
import { InventoriesTable } from '../features/inventories/InventoriesTable'
import {
  createInventory,
  getInventoryFormOptions,
  importInventoriesCsv,
  listInventories,
  updateInventory,
  type Inventory,
  type InventoryProductOption,
  type InventoryPayload,
  type InventorySupplierOption,
  type ListInventoriesParams,
  type PaginatedInventories,
} from '../features/inventories/inventoriesApi'
import { useListControls } from '../hooks/useListControls'
import {
  createPaginationMeta,
  normalizePaginationMeta,
} from '../utils/paginationMeta'

const PAGE_SIZE = 10

type InventoryModalState = { type: 'form'; inventory?: Inventory } | null

type SortableInventoryField = Extract<
  ListInventoriesParams['sortBy'],
  'createdAt' | 'updatedAt' | 'quantity' | 'remainingQuantity'
>

export function InventoriesPage() {
  const navigate = useNavigate()
  const [inventories, setInventories] = useState<Inventory[]>([])
  const [products, setProducts] = useState<InventoryProductOption[]>([])
  const [suppliers, setSuppliers] = useState<InventorySupplierOption[]>([])
  const [meta, setMeta] = useState<PaginatedInventories['meta']>(() =>
    createPaginationMeta(PAGE_SIZE),
  )
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isImporting, setIsImporting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [modalState, setModalState] = useState<InventoryModalState>(null)
  const {
    page,
    search,
    sortBy,
    sortOrder,
    handleSearchChange,
    handlePageChange,
    handleSort,
  } = useListControls<SortableInventoryField>({
    initialSortBy: 'createdAt',
    onBeforeChange: () => setIsLoading(true),
  })

  const fetchInventories = useCallback((): Promise<PaginatedInventories> => {
    return listInventories({
      page,
      limit: PAGE_SIZE,
      search,
      sortBy,
      order: sortOrder,
    })
  }, [page, search, sortBy, sortOrder])

  function applyInventoriesResponse(response: PaginatedInventories): void {
    setInventories(response.data)
    setMeta(normalizePaginationMeta(response.meta))
  }

  useEffect(() => {
    let isActive = true

    async function loadInventories(): Promise<void> {
      try {
        const [inventoriesResponse, formOptions] = await Promise.all([
          fetchInventories(),
          getInventoryFormOptions(),
        ])

        if (!isActive) {
          return
        }

        applyInventoriesResponse(inventoriesResponse)
        setProducts(formOptions.products)
        setSuppliers(formOptions.suppliers)
      } catch (error) {
        if (!isActive) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Impossible de charger les stocks.',
        )
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadInventories()

    return () => {
      isActive = false
    }
  }, [fetchInventories])

  function openGlobalHistory(): void {
    navigate('/inventory-movements')
  }

  function openLineHistory(inventory: Inventory): void {
    navigate(`/inventory-movements?inventoryId=${inventory.id}`)
  }

  async function handleSaveInventory(payload: InventoryPayload): Promise<void> {
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      if (modalState?.type === 'form' && modalState.inventory) {
        await updateInventory(modalState.inventory.id, payload)
        setSuccessMessage('Ligne de stock modifiée avec succès.')
      } else {
        await createInventory(payload)
        setSuccessMessage('Produit ajouté au stock avec succès.')
      }

      setModalState(null)
      applyInventoriesResponse(await fetchInventories())
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
            : "Impossible d'enregistrer la ligne de stock.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleImportCsv(file: File): Promise<void> {
    setIsImporting(true)
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const summary = await importInventoriesCsv(file)
      const [inventoriesResponse, formOptions] = await Promise.all([
        fetchInventories(),
        getInventoryFormOptions(),
      ])

      applyInventoriesResponse(inventoriesResponse)
      setProducts(formOptions.products)
      setSuppliers(formOptions.suppliers)
      setSuccessMessage(
        `${summary.rowsProcessed} lignes traitées : ${summary.inventoriesCreated} lots importés avec leurs mouvements, ${summary.lotsSkipped} lots ignorés faute de prix net.`,
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible d'importer le fichier CSV.",
      )
    } finally {
      setIsImporting(false)
      setIsLoading(false)
    }
  }

  function handleImportValidationError(message: string): void {
    setSuccessMessage('')
    setErrorMessage(message)
  }

  return (
    <section className="flex min-h-[calc(100vh-7rem)] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Gestion
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Entrée en stock
          </h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={openGlobalHistory}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50"
          >
            Historique global
          </button>
          <InventoryCsvImportButton
            isImporting={isImporting}
            onSelect={handleImportCsv}
            onValidationError={handleImportValidationError}
          />
          <button
            type="button"
            disabled={isImporting}
            onClick={() => setModalState({ type: 'form' })}
            className="rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Ajouter une ligne
          </button>
        </div>
      </div>

      {errorMessage ? <Alert type="error" message={errorMessage} /> : null}
      {successMessage ? <Alert type="success" message={successMessage} /> : null}

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <label
          htmlFor="inventory-search"
          className="block text-sm font-medium text-slate-700"
        >
          Rechercher dans le stock
        </label>
        <input
          id="inventory-search"
          type="search"
          value={search}
          onChange={handleSearchChange}
          placeholder="Produit, référence ou fournisseur"
          className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 sm:w-[42rem]"
        />
      </div>

      <InventoriesTable
        inventories={inventories}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEdit={(inventory) => setModalState({ type: 'form', inventory })}
        onHistory={openLineHistory}
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

      {modalState?.type === 'form' ? (
        <InventoryModal
          title={
            modalState.inventory
              ? 'Modifier la ligne de stock'
              : 'Ajouter une entrée en stock'
          }
          onClose={() => setModalState(null)}
          errorMessage={errorMessage}
        >
          <InventoryForm
            inventory={modalState.inventory}
            products={products}
            suppliers={suppliers}
            isSubmitting={isSubmitting}
            onCancel={() => setModalState(null)}
            onSubmit={handleSaveInventory}
          />
        </InventoryModal>
      ) : null}

    </section>
  )
}
