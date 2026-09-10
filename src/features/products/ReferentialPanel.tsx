import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { Alert } from '../../components/Alert'
import { TextField } from '../../components/TextField'
import { formatDateTime } from '../../utils/displayFormatters'
import { getSortLabel } from '../../utils/sortLabel'
import { ProductModal } from './ProductModal'

type SortOrder = 'asc' | 'desc'
type SortField = 'label' | 'createdAt' | 'updatedAt'

export interface ReferentialItem {
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
  onCreate: (value: string) => Promise<boolean>
  onUpdate: (item: TItem, value: string) => Promise<boolean>
  onDelete: (item: TItem) => Promise<boolean>
  onClearMessages: () => void
}

type ModalState<TItem> =
  | { type: 'form'; item?: TItem }
  | { type: 'delete'; item: TItem }
  | null

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

export function ReferentialPanel<TItem extends ReferentialItem>({
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

    const succeeded = modalState.item
      ? await onUpdate(modalState.item, trimmedValue)
      : await onCreate(trimmedValue)

    if (succeeded) {
      setModalState(null)
    }
  }

  async function handleDelete(): Promise<void> {
    if (modalState?.type !== 'delete') {
      return
    }

    if (await onDelete(modalState.item)) {
      setModalState(null)
    }
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
          className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 sm:w-64"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <SortableHeader
                  label={getSortLabel(sortBy, sortOrder, 'label', fieldLabel, {
                    inactiveIndicator: '↕',
                    ascIndicator: '↑',
                    descIndicator: '↓',
                  })}
                  onSort={() => handleSort('label')}
                />
                <SortableHeader
                  label={getSortLabel(
                    sortBy,
                    sortOrder,
                    'createdAt',
                    'Créé le',
                    {
                      inactiveIndicator: '↕',
                      ascIndicator: '↑',
                      descIndicator: '↓',
                    },
                  )}
                  onSort={() => handleSort('createdAt')}
                />
                <SortableHeader
                  label={getSortLabel(
                    sortBy,
                    sortOrder,
                    'updatedAt',
                    'Mis à jour le',
                    {
                      inactiveIndicator: '↕',
                      ascIndicator: '↑',
                      descIndicator: '↓',
                    },
                  )}
                  onSort={() => handleSort('updatedAt')}
                />
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <ReferentialRows
                items={filteredItems}
                isLoading={isLoading}
                getLabel={getLabel}
                onClearMessages={onClearMessages}
                onUpdate={openUpdateModal}
                onDelete={(item) => setModalState({ type: 'delete', item })}
              />
            </tbody>
          </table>
        </div>
      </div>

      {modalState?.type === 'form' ? (
        <ProductModal
          title={modalState.item ? `Modifier ${title}` : `Ajouter ${title}`}
          onClose={() => setModalState(null)}
          errorMessage={errorMessage}
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
            <ModalActions
              submitLabel={isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              isSubmitting={isSubmitting}
              onCancel={() => setModalState(null)}
            />
          </form>
        </ProductModal>
      ) : null}

      {modalState?.type === 'delete' ? (
        <ProductModal
          title="Confirmer la suppression"
          onClose={() => setModalState(null)}
          errorMessage={errorMessage}
        >
          <div className="space-y-5">
            <p className="text-sm leading-6 text-slate-600">
              Voulez-vous vraiment supprimer{' '}
              <span className="font-semibold text-slate-950">
                {getLabel(modalState.item)}
              </span>{' '}
              ?
            </p>
            <ModalActions
              submitLabel={isSubmitting ? 'Suppression...' : 'Supprimer'}
              isSubmitting={isSubmitting}
              isDanger
              onCancel={() => setModalState(null)}
              onConfirm={() => {
                void handleDelete()
              }}
            />
          </div>
        </ProductModal>
      ) : null}
    </div>
  )
}

interface SortableHeaderProps {
  label: string
  onSort: () => void
}

function SortableHeader({ label, onSort }: SortableHeaderProps) {
  return (
    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
      <button
        type="button"
        onClick={onSort}
        className="inline-flex items-center gap-1 transition hover:text-teal-700"
      >
        {label}
      </button>
    </th>
  )
}

interface ReferentialRowsProps<TItem extends ReferentialItem> {
  items: TItem[]
  isLoading: boolean
  getLabel: (item: TItem) => string
  onClearMessages: () => void
  onUpdate: (item: TItem) => void
  onDelete: (item: TItem) => void
}

function ReferentialRows<TItem extends ReferentialItem>({
  items,
  isLoading,
  getLabel,
  onClearMessages,
  onUpdate,
  onDelete,
}: ReferentialRowsProps<TItem>) {
  if (isLoading) {
    return <EmptyRow message="Chargement..." />
  }

  if (items.length === 0) {
    return <EmptyRow message="Aucun élément trouvé." />
  }

  return (
    <>
      {items.map((item) => (
        <tr key={item.id} className="hover:bg-teal-50/60">
          <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-950">
            {getLabel(item)}
          </td>
          <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
            {formatDateTime(item.createdAt)}
          </td>
          <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
            {formatDateTime(item.updatedAt)}
          </td>
          <td className="px-4 py-4">
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onUpdate(item)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-50"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearMessages()
                  onDelete(item)
                }}
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
              >
                Supprimer
              </button>
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}

function EmptyRow({ message }: { message: string }) {
  return (
    <tr>
      <td
        colSpan={4}
        className="px-4 py-10 text-center text-sm font-medium text-slate-500"
      >
        {message}
      </td>
    </tr>
  )
}

interface ModalActionsProps {
  submitLabel: string
  isSubmitting: boolean
  isDanger?: boolean
  onCancel: () => void
  onConfirm?: () => void
}

function ModalActions({
  submitLabel,
  isSubmitting,
  isDanger = false,
  onCancel,
  onConfirm,
}: ModalActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
      >
        Annuler
      </button>
      <button
        type={onConfirm ? 'button' : 'submit'}
        disabled={isSubmitting}
        onClick={onConfirm}
        className={`rounded-lg px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed ${
          isDanger
            ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'
            : 'bg-teal-700 hover:bg-teal-800 disabled:bg-teal-300'
        }`}
      >
        {submitLabel}
      </button>
    </div>
  )
}
