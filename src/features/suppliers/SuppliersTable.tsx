import { displayValue, formatDateTime } from '../../utils/displayFormatters'
import type { Supplier } from './suppliersApi'

interface SuppliersTableProps {
  suppliers: Supplier[]
  isLoading: boolean
  sortBy: 'name' | 'createdAt' | 'updatedAt'
  sortOrder: 'asc' | 'desc'
  onSort: (field: 'name' | 'createdAt' | 'updatedAt') => void
  onDetails: (supplier: Supplier) => void
  onEdit: (supplier: Supplier) => void
  onDelete: (supplier: Supplier) => void
}

export function SuppliersTable({
  suppliers,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onDetails,
  onEdit,
  onDelete,
}: SuppliersTableProps) {
  function getSortIndicator(field: 'name' | 'createdAt' | 'updatedAt'): string {
    if (sortBy !== field) {
      return '↕'
    }

    return sortOrder === 'asc' ? '↑' : '↓'
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <SortableHeader
                label="Nom"
                indicator={getSortIndicator('name')}
                onSort={() => onSort('name')}
              />
              <Header label="Adresse" />
              <Header label="Email" />
              <Header label="Téléphone" />
              <SortableHeader
                label="Créé le"
                indicator={getSortIndicator('createdAt')}
                onSort={() => onSort('createdAt')}
              />
              <SortableHeader
                label="Mis à jour le"
                indicator={getSortIndicator('updatedAt')}
                onSort={() => onSort('updatedAt')}
              />
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <EmptyRow message="Chargement des fournisseurs..." />
            ) : suppliers.length === 0 ? (
              <EmptyRow message="Aucun fournisseur enregistré pour le moment." />
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
                    {formatDateTime(supplier.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {formatDateTime(supplier.updatedAt)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <RowAction label="Détails" onClick={() => onDetails(supplier)} />
                      <RowAction label="Modifier" onClick={() => onEdit(supplier)} />
                      <RowAction
                        label="Supprimer"
                        isDanger
                        onClick={() => onDelete(supplier)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Header({ label }: { label: string }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
      {label}
    </th>
  )
}

interface SortableHeaderProps {
  label: string
  indicator: string
  onSort: () => void
}

function SortableHeader({ label, indicator, onSort }: SortableHeaderProps) {
  return (
    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
      <button
        type="button"
        onClick={onSort}
        className="inline-flex items-center gap-1 transition hover:text-teal-700"
      >
        {label}
        <span aria-hidden="true">{indicator}</span>
      </button>
    </th>
  )
}

function EmptyRow({ message }: { message: string }) {
  return (
    <tr>
      <td
        colSpan={7}
        className="px-4 py-10 text-center text-sm font-medium text-slate-500"
      >
        {message}
      </td>
    </tr>
  )
}

interface RowActionProps {
  label: string
  isDanger?: boolean
  onClick: () => void
}

function RowAction({ label, isDanger = false, onClick }: RowActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
        isDanger
          ? 'border-red-200 text-red-700 hover:bg-red-50'
          : 'border-slate-200 text-teal-700 hover:bg-teal-50'
      }`}
    >
      {label}
    </button>
  )
}
