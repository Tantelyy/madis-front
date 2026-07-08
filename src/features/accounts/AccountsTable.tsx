import { displayValue, formatDateTime } from '../../utils/displayFormatters'
import { getPermissionCodes } from './accountAccess'
import type { Account } from './accountsApi'

type SortableAccountField = 'userName' | 'email' | 'createdAt' | 'updatedAt'

interface AccountsTableProps {
  accounts: Account[]
  isLoading: boolean
  sortBy: SortableAccountField
  sortOrder: 'asc' | 'desc'
  currentUserId: number | null
  onSort: (field: SortableAccountField) => void
  onEdit: (account: Account) => void
  onDisable: (account: Account) => void
}

export function AccountsTable({
  accounts,
  isLoading,
  sortBy,
  sortOrder,
  currentUserId,
  onSort,
  onEdit,
  onDisable,
}: AccountsTableProps) {
  function getSortIndicator(field: SortableAccountField): string {
    if (sortBy !== field) {
      return '-'
    }

    return sortOrder === 'asc' ? 'ASC' : 'DESC'
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <SortableHeader
                label="Utilisateur"
                indicator={getSortIndicator('userName')}
                onSort={() => onSort('userName')}
              />
              <SortableHeader
                label="Email"
                indicator={getSortIndicator('email')}
                onSort={() => onSort('email')}
              />
              <Header label="Rôle" />
              <Header label="Permissions" />
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
              <EmptyRow message="Chargement des comptes..." />
            ) : accounts.length === 0 ? (
              <EmptyRow message="Aucun compte actif pour le moment." />
            ) : (
              accounts.map((account) => (
                <tr key={account.id} className="hover:bg-teal-50/60">
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-950">
                    {account.userName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {account.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {displayValue(account.role?.label)}
                  </td>
                  <td className="max-w-sm px-4 py-4 text-sm text-slate-600">
                    {formatPermissions(account)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {formatDateTime(account.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {formatDateTime(account.updatedAt)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <RowAction label="Modifier" onClick={() => onEdit(account)} />
                      <RowAction
                        label="Désactiver"
                        isDanger
                        disabled={account.id === currentUserId}
                        onClick={() => onDisable(account)}
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

function formatPermissions(account: Account): string {
  const codes = getPermissionCodes(account.permissions)

  if (codes.length === 0) {
    return '-'
  }

  return codes.join(', ')
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
  disabled?: boolean
  onClick: () => void
}

function RowAction({
  label,
  isDanger = false,
  disabled = false,
  onClick,
}: RowActionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 ${
        isDanger
          ? 'border-red-200 text-red-700 hover:bg-red-50'
          : 'border-slate-200 text-teal-700 hover:bg-teal-50'
      }`}
    >
      {label}
    </button>
  )
}
