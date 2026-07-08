import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/Alert'
import { Pagination } from '../components/Pagination'
import { SupplierDetails } from '../features/suppliers/SupplierDetails'
import { SupplierForm } from '../features/suppliers/SupplierForm'
import { SupplierModal } from '../features/suppliers/SupplierModal'
import { SuppliersTable } from '../features/suppliers/SuppliersTable'
import {
  createSupplier,
  deleteSupplier,
  listSuppliers,
  updateSupplier,
  type ListSuppliersParams,
  type PaginatedSuppliers,
  type Supplier,
  type SupplierPayload,
} from '../features/suppliers/suppliersApi'
import { useListControls } from '../hooks/useListControls'
import {
  createPaginationMeta,
  normalizePaginationMeta,
} from '../utils/paginationMeta'

const PAGE_SIZE = 10

type SupplierModalState =
  | { type: 'details'; supplier: Supplier }
  | { type: 'form'; supplier?: Supplier }
  | { type: 'delete'; supplier: Supplier }
  | null

type SortableSupplierField = Extract<
  ListSuppliersParams['sortBy'],
  'name' | 'createdAt' | 'updatedAt'
>

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [meta, setMeta] = useState<PaginatedSuppliers['meta']>(() =>
    createPaginationMeta(PAGE_SIZE),
  )
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [modalState, setModalState] = useState<SupplierModalState>(null)
  const {
    page,
    setPage,
    search,
    sortBy,
    sortOrder,
    handleSearchChange,
    handlePageChange,
    handleSort,
  } = useListControls<SortableSupplierField>({
    initialSortBy: 'createdAt',
    onBeforeChange: () => setIsLoading(true),
  })

  const fetchSuppliers = useCallback((): Promise<PaginatedSuppliers> => {
    return listSuppliers({
      page,
      limit: PAGE_SIZE,
      search,
      sortBy,
      order: sortOrder,
    })
  }, [page, search, sortBy, sortOrder])

  function applySuppliersResponse(response: PaginatedSuppliers): void {
    setSuppliers(response.data)
    setMeta(normalizePaginationMeta(response.meta))
  }

  useEffect(() => {
    let isActive = true

    async function loadSuppliers(): Promise<void> {
      try {
        const response = await fetchSuppliers()

        if (!isActive) {
          return
        }

        applySuppliersResponse(response)
      } catch (error) {
        if (!isActive) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Impossible de charger les fournisseurs.',
        )
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadSuppliers()

    return () => {
      isActive = false
    }
  }, [fetchSuppliers])

  async function handleSaveSupplier(payload: SupplierPayload): Promise<void> {
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      if (modalState?.type === 'form' && modalState.supplier) {
        await updateSupplier(modalState.supplier.id, payload)
        setSuccessMessage('Fournisseur modifié avec succès.')
      } else {
        await createSupplier(payload)
        setSuccessMessage('Fournisseur ajouté avec succès.')
      }

      setModalState(null)
      applySuppliersResponse(await fetchSuppliers())
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible d’enregistrer le fournisseur.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteSupplier(): Promise<void> {
    if (modalState?.type !== 'delete') {
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await deleteSupplier(modalState.supplier.id)
      setSuccessMessage('Fournisseur supprimé avec succès.')
      setModalState(null)

      if (suppliers.length === 1 && page > 1) {
        setIsLoading(true)
        setPage(page - 1)
        return
      }

      applySuppliersResponse(await fetchSuppliers())
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible de supprimer le fournisseur.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-7rem)] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Gestion
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Fournisseurs
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setModalState({ type: 'form' })}
          className="rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-200"
        >
          Ajouter un fournisseur
        </button>
      </div>

      {errorMessage ? <Alert type="error" message={errorMessage} /> : null}
      {successMessage ? <Alert type="success" message={successMessage} /> : null}

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <label
          htmlFor="supplier-search"
          className="block text-sm font-medium text-slate-700"
        >
          Rechercher un fournisseur
        </label>
        <input
          id="supplier-search"
          type="search"
          value={search}
          onChange={handleSearchChange}
          placeholder="Nom, adresse, email ou téléphone"
          className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 sm:w-[36rem]"
        />
      </div>
      <SuppliersTable
        suppliers={suppliers}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onDetails={(supplier) => setModalState({ type: 'details', supplier })}
        onEdit={(supplier) => setModalState({ type: 'form', supplier })}
        onDelete={(supplier) => setModalState({ type: 'delete', supplier })}
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

      {modalState?.type === 'details' ? (
        <SupplierModal
          title="Détails du fournisseur"
          onClose={() => setModalState(null)}
        >
          <SupplierDetails supplier={modalState.supplier} />
        </SupplierModal>
      ) : null}

      {modalState?.type === 'form' ? (
        <SupplierModal
          title={
            modalState.supplier
              ? 'Modifier le fournisseur'
              : 'Ajouter un fournisseur'
          }
          onClose={() => setModalState(null)}
        >
          <SupplierForm
            supplier={modalState.supplier}
            isSubmitting={isSubmitting}
            onCancel={() => setModalState(null)}
            onSubmit={handleSaveSupplier}
          />
        </SupplierModal>
      ) : null}

      {modalState?.type === 'delete' ? (
        <SupplierModal
          title="Confirmer la suppression"
          onClose={() => setModalState(null)}
        >
          <div className="space-y-5">
            <p className="text-sm leading-6 text-slate-600">
              Voulez-vous vraiment supprimer le fournisseur{' '}
              <span className="font-semibold text-slate-950">
                {modalState.supplier.name}
              </span>{' '}
              ?
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setModalState(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  void handleDeleteSupplier()
                }}
                className="rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {isSubmitting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </SupplierModal>
      ) : null}
    </section>
  )
}
