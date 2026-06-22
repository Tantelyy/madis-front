import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { Alert } from '../components/Alert'
import { TextField } from '../components/TextField'
import { ProductModal } from '../features/products/ProductModal'
import {
  createProductFormat,
  createProductMark,
  createProductSpecification,
  createProductType,
  deleteProductFormat,
  deleteProductMark,
  deleteProductSpecification,
  deleteProductType,
  listProductFormats,
  listProductMarks,
  listProductSpecifications,
  listProductTypes,
  updateProductFormat,
  updateProductMark,
  updateProductSpecification,
  updateProductType,
  type ProductFormat,
  type ProductMark,
  type ProductSpecification,
  type ProductType,
} from '../features/products/productsApi'

type SortOrder = 'asc' | 'desc'
type SortField = 'label' | 'createdAt' | 'updatedAt'
type TabKey = 'types' | 'marks' | 'formats' | 'specifications'

interface ReferentialItem {
  id: number
  createdAt: string
  updatedAt: string
}

interface ReferentialPanelProps<TItem extends ReferentialItem> {
  title: string
  fieldLabel: string
  createButtonLabel: string
  placeholder: string
  items: TItem[]
  isLoading: boolean
  isSubmitting: boolean
  errorMessage: string
  successMessage: string
  getLabel: (item: TItem) => string
  onCreate: (value: string) => Promise<void>
  onUpdate: (item: TItem, value: string) => Promise<void>
  onDelete: (item: TItem) => Promise<void>
  onClearMessages: () => void
}

type ModalState<TItem> =
  | { type: 'form'; item?: TItem }
  | { type: 'delete'; item: TItem }
  | null

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function sortItems<TItem extends ReferentialItem>(
  items: TItem[],
  sortBy: SortField,
  sortOrder: SortOrder,
  getLabel: (item: TItem) => string,
): TItem[] {
  return [...items].sort((firstItem, secondItem) => {
    const firstValue =
      sortBy === 'label' ? getLabel(firstItem) : firstItem[sortBy]
    const secondValue =
      sortBy === 'label' ? getLabel(secondItem) : secondItem[sortBy]
    const comparison = firstValue.localeCompare(secondValue)

    return sortOrder === 'asc' ? comparison : -comparison
  })
}

function ReferentialPanel<TItem extends ReferentialItem>({
  title,
  fieldLabel,
  createButtonLabel,
  placeholder,
  items,
  isLoading,
  isSubmitting,
  errorMessage,
  successMessage,
  getLabel,
  onCreate,
  onUpdate,
  onDelete,
  onClearMessages,
}: ReferentialPanelProps<TItem>) {
  const [search, setSearch] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortField>('label')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [modalState, setModalState] = useState<ModalState<TItem>>(null)
  const [formValue, setFormValue] = useState<string>('')

  const filteredItems = useMemo(() => {
    const trimmedSearch = search.trim().toLowerCase()
    const matchingItems = trimmedSearch
      ? items.filter((item) =>
          getLabel(item).toLowerCase().includes(trimmedSearch),
        )
      : items

    return sortItems(matchingItems, sortBy, sortOrder, getLabel)
  }, [getLabel, items, search, sortBy, sortOrder])

  function handleSort(nextSortBy: SortField): void {
    setSortOrder((currentSortOrder) =>
      sortBy === nextSortBy && currentSortOrder === 'asc' ? 'desc' : 'asc',
    )
    setSortBy(nextSortBy)
  }

  function getSortLabel(field: SortField, label: string): string {
    if (sortBy !== field) {
      return `${label} ↕`
    }

    return `${label} ${sortOrder === 'asc' ? '↑' : '↓'}`
  }

  function openCreateModal(): void {
    onClearMessages()
    setFormValue('')
    setModalState({ type: 'form' })
  }

  function openUpdateModal(item: TItem): void {
    onClearMessages()
    setFormValue(getLabel(item))
    setModalState({ type: 'form', item })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const trimmedValue = formValue.trim()

    if (!trimmedValue || modalState?.type !== 'form') {
      return
    }

    if (modalState.item) {
      await onUpdate(modalState.item, trimmedValue)
    } else {
      await onCreate(trimmedValue)
    }

    setModalState(null)
  }

  async function handleDelete(): Promise<void> {
    if (modalState?.type !== 'delete') {
      return
    }

    await onDelete(modalState.item)
    setModalState(null)
  }

  return (
    <div className="space-y-5">
      {errorMessage ? <Alert type="error" message={errorMessage} /> : null}
      {successMessage ? <Alert type="success" message={successMessage} /> : null}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-200"
        >
          {createButtonLabel}
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label
            htmlFor={`${title}-search`}
            className="block text-sm font-medium text-slate-700"
          >
            Filtrer
          </label>
          <input
            id={`${title}-search`}
            type="search"
            value={search}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setSearch(event.target.value)
            }
            placeholder={`Rechercher dans ${title.toLowerCase()}`}
            className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 sm:w-[36rem]"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <button
                    type="button"
                    onClick={() => handleSort('label')}
                    className="inline-flex items-center gap-1 transition hover:text-teal-700"
                  >
                    {getSortLabel('label', fieldLabel)}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <button
                    type="button"
                    onClick={() => handleSort('createdAt')}
                    className="inline-flex items-center gap-1 transition hover:text-teal-700"
                  >
                    {getSortLabel('createdAt', 'Créé le')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <button
                    type="button"
                    onClick={() => handleSort('updatedAt')}
                    className="inline-flex items-center gap-1 transition hover:text-teal-700"
                  >
                    {getSortLabel('updatedAt', 'Mis à jour le')}
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
                    colSpan={4}
                    className="px-4 py-10 text-center text-sm font-medium text-slate-500"
                  >
                    Chargement...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-sm font-medium text-slate-500"
                  >
                    Aucun élément trouvé.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-teal-50/60">
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-950">
                      {getLabel(item)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                      {formatDate(item.updatedAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openUpdateModal(item)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-50"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onClearMessages()
                            setModalState({ type: 'delete', item })
                          }}
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

      {modalState?.type === 'form' ? (
        <ProductModal
          title={modalState.item ? `Modifier ${title}` : `Ajouter ${title}`}
          onClose={() => setModalState(null)}
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <TextField
              id={`${title}-value`}
              name="value"
              label={fieldLabel}
              value={formValue}
              placeholder={placeholder}
              required
              onChange={(event) => setFormValue(event.target.value)}
            />
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setModalState(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-teal-300"
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </ProductModal>
      ) : null}

      {modalState?.type === 'delete' ? (
        <ProductModal
          title="Confirmer la suppression"
          onClose={() => setModalState(null)}
        >
          <div className="space-y-5">
            <p className="text-sm leading-6 text-slate-600">
              Voulez-vous vraiment supprimer{' '}
              <span className="font-semibold text-slate-950">
                {getLabel(modalState.item)}
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
                  void handleDelete()
                }}
                className="rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {isSubmitting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </ProductModal>
      ) : null}
    </div>
  )
}

export function ProductReferentialsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('types')
  const [types, setTypes] = useState<ProductType[]>([])
  const [marks, setMarks] = useState<ProductMark[]>([])
  const [formats, setFormats] = useState<ProductFormat[]>([])
  const [specifications, setSpecifications] = useState<ProductSpecification[]>(
    [],
  )
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')

  const clearMessages = useCallback((): void => {
    setErrorMessage('')
    setSuccessMessage('')
  }, [])

  const loadReferentials = useCallback(async (): Promise<void> => {
    const [typesResponse, marksResponse, formatsResponse, specificationsResponse] =
      await Promise.all([
        listProductTypes(),
        listProductMarks(),
        listProductFormats(),
        listProductSpecifications(),
      ])

    setTypes(typesResponse)
    setMarks(marksResponse)
    setFormats(formatsResponse)
    setSpecifications(specificationsResponse)
  }, [])

  useEffect(() => {
    let isActive = true

    async function load(): Promise<void> {
      try {
        await loadReferentials()
      } catch (error) {
        if (!isActive) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Impossible de charger les referentiels produits.',
        )
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      isActive = false
    }
  }, [loadReferentials])

  async function runMutation(
    action: () => Promise<void>,
    successMessageValue: string,
  ): Promise<void> {
    setIsSubmitting(true)
    clearMessages()

    try {
      await action()
      await loadReferentials()
      setSuccessMessage(successMessageValue)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Opération impossible.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'types', label: 'Types' },
    { key: 'marks', label: 'Marques' },
    { key: 'formats', label: 'Formats' },
    { key: 'specifications', label: 'Spécifications' },
  ]

  return (
    <section className="flex min-h-[calc(100vh-7rem)] flex-col gap-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          Gestion
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Référentiels produits
        </h1>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              clearMessages()
              setActiveTab(tab.key)
            }}
            className={`rounded-t-lg px-4 py-3 text-sm font-semibold transition ${
              activeTab === tab.key
                ? 'bg-white text-teal-800 shadow-sm'
                : 'text-slate-600 hover:bg-teal-50 hover:text-teal-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'types' ? (
        <ReferentialPanel
          title="Types"
          fieldLabel="Type"
          createButtonLabel="Ajouter un type"
          placeholder="Type de produit"
          items={types}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          successMessage={successMessage}
          getLabel={(item) => item.type}
          onClearMessages={clearMessages}
          onCreate={(value) =>
            runMutation(
              async () => {
                await createProductType(value)
              },
              'Type ajouté avec succès.',
            )
          }
          onUpdate={(item, value) =>
            runMutation(
              async () => {
                await updateProductType(item.id, value)
              },
              'Type modifié avec succès.',
            )
          }
          onDelete={(item) =>
            runMutation(
              async () => {
                await deleteProductType(item.id)
              },
              'Type supprimé avec succès.',
            )
          }
        />
      ) : null}

      {activeTab === 'marks' ? (
        <ReferentialPanel
          title="Marques"
          fieldLabel="Marque"
          createButtonLabel="Ajouter une marque"
          placeholder="Marque du produit"
          items={marks}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          successMessage={successMessage}
          getLabel={(item) => item.name}
          onClearMessages={clearMessages}
          onCreate={(value) =>
            runMutation(
              async () => {
                await createProductMark(value)
              },
              'Marque ajoutée avec succès.',
            )
          }
          onUpdate={(item, value) =>
            runMutation(
              async () => {
                await updateProductMark(item.id, value)
              },
              'Marque modifiée avec succès.',
            )
          }
          onDelete={(item) =>
            runMutation(
              async () => {
                await deleteProductMark(item.id)
              },
              'Marque supprimée avec succès.',
            )
          }
        />
      ) : null}

      {activeTab === 'formats' ? (
        <ReferentialPanel
          title="Formats"
          fieldLabel="Format"
          createButtonLabel="Ajouter un format"
          placeholder="Format du produit"
          items={formats}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          successMessage={successMessage}
          getLabel={(item) => item.format}
          onClearMessages={clearMessages}
          onCreate={(value) =>
            runMutation(
              async () => {
                await createProductFormat(value)
              },
              'Format ajouté avec succès.',
            )
          }
          onUpdate={(item, value) =>
            runMutation(
              async () => {
                await updateProductFormat(item.id, value)
              },
              'Format modifié avec succès.',
            )
          }
          onDelete={(item) =>
            runMutation(
              async () => {
                await deleteProductFormat(item.id)
              },
              'Format supprimé avec succès.',
            )
          }
        />
      ) : null}

      {activeTab === 'specifications' ? (
        <ReferentialPanel
          title="Spécifications"
          fieldLabel="Spécification"
          createButtonLabel="Ajouter une spécification"
          placeholder="Spécification du produit"
          items={specifications}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          successMessage={successMessage}
          getLabel={(item) => item.specification}
          onClearMessages={clearMessages}
          onCreate={(value) =>
            runMutation(
              async () => {
                await createProductSpecification(value)
              },
              'Spécification ajoutée avec succès.',
            )
          }
          onUpdate={(item, value) =>
            runMutation(
              async () => {
                await updateProductSpecification(item.id, value)
              },
              'Spécification modifiée avec succès.',
            )
          }
          onDelete={(item) =>
            runMutation(
              async () => {
                await deleteProductSpecification(item.id)
              },
              'Spécification supprimée avec succès.',
            )
          }
        />
      ) : null}
    </section>
  )
}
