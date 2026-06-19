import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { Alert } from '../components/Alert'
import { Pagination } from '../components/Pagination'
import { SupplierForm } from '../features/suppliers/SupplierForm'
import { SupplierModal } from '../features/suppliers/SupplierModal'
import {
  createSupplier,
  deleteSupplier,
  listSuppliers,
  updateSupplier,
  type ListSuppliersParams,
  type PaginatedSuppliers,
  type Supplier,
  type SupplierPayload,
  type SupplierUser,
} from '../features/suppliers/suppliersApi'

const PAGE_SIZE = 10

type SupplierModalState =
  | { type: 'details'; supplier: Supplier }
  | { type: 'form'; supplier?: Supplier }
  | { type: 'delete'; supplier: Supplier }
  | null

type SortableSupplierField = Extract<
  ListSuppliersParams['sortBy'],
  'createdAt' | 'updatedAt'
>

function formatDate(value: string | null): string {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function displayValue(value: string | null): string {
  return value?.trim() ? value : '-'
}

function formatUser(user: SupplierUser | null | undefined): string {
  if (!user) {
    return '-'
  }

  return `${user.userName} (${user.email})`
}

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [meta, setMeta] = useState<PaginatedSuppliers['meta']>({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
  })
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortableSupplierField>('createdAt')
  const [sortOrder, setSortOrder] =
    useState<NonNullable<ListSuppliersParams['order']>>('desc')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [modalState, setModalState] = useState<SupplierModalState>(null)

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
    setMeta({
      ...response.meta,
      totalPages: Math.max(response.meta.totalPages, 1),
    })
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

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>): void {
    setIsLoading(true)
    setSearch(event.target.value)
    setPage(1)
  }

  function handlePageChange(nextPage: number): void {
    setIsLoading(true)
    setPage(nextPage)
  }

  function handleSort(nextSortBy: SortableSupplierField): void {
    setIsLoading(true)
    setPage(1)
    setSortOrder((currentSortOrder) =>
      sortBy === nextSortBy && currentSortOrder === 'desc' ? 'asc' : 'desc',
    )
    setSortBy(nextSortBy)
  }

  function getSortIndicator(field: SortableSupplierField): string {
    if (sortBy !== field) {
      return '↕'
    }

    return sortOrder === 'asc' ? '↑' : '↓'
  }

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
          className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Nom
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Adresse
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Téléphone
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <button
                    type="button"
                    onClick={() => handleSort('createdAt')}
                    className="inline-flex items-center gap-1 transition hover:text-teal-700"
                  >
                    Créé le
                    <span aria-hidden="true">
                      {getSortIndicator('createdAt')}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <button
                    type="button"
                    onClick={() => handleSort('updatedAt')}
                    className="inline-flex items-center gap-1 transition hover:text-teal-700"
                  >
                    Mis à jour le
                    <span aria-hidden="true">
                      {getSortIndicator('updatedAt')}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm font-medium text-slate-500"
                  >
                    Chargement des fournisseurs...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm font-medium text-slate-500"
                  >
                    Aucun fournisseur enregistré pour le moment.
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-teal-50/60">
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-950">
                      {supplier.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {displayValue(supplier.address)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                      {displayValue(supplier.email)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                      {displayValue(supplier.phone)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                      {formatDate(supplier.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                      {formatDate(supplier.updatedAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setModalState({ type: 'details', supplier })
                          }
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-50"
                        >
                          Détails
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setModalState({ type: 'form', supplier })
                          }
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-50"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setModalState({ type: 'delete', supplier })
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Nom
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-950">
                {modalState.supplier.name}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Email
              </dt>
              <dd className="mt-1 text-sm text-slate-700">
                {displayValue(modalState.supplier.email)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Téléphone
              </dt>
              <dd className="mt-1 text-sm text-slate-700">
                {displayValue(modalState.supplier.phone)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Adresse
              </dt>
              <dd className="mt-1 text-sm text-slate-700">
                {formatUser(modalState.supplier.createdByUser)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Créé le
              </dt>
              <dd className="mt-1 text-sm text-slate-700">
                {formatDate(modalState.supplier.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Mis à jour le
              </dt>
              <dd className="mt-1 text-sm text-slate-700">
                {formatDate(modalState.supplier.updatedAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Créé par
              </dt>
              <dd className="mt-1 text-sm text-slate-700">
                {formatUser(modalState.supplier.createdByUser)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">

                Mis à jour par
              </dt>
              <dd className="mt-1 text-sm text-slate-700">
                {formatUser(modalState.supplier.updatedByUser)}
              </dd>
            </div>
          </dl>
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
