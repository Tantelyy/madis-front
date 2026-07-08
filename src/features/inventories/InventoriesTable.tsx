import { useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { displayValue, formatDateTime } from '../../utils/displayFormatters'
import { formatPrice, formatRoundedPrice } from './inventoryFormatters'
import type { Inventory, ListInventoriesParams } from './inventoriesApi'

type SortableInventoryField = Extract<
  ListInventoriesParams['sortBy'],
  'createdAt' | 'updatedAt' | 'quantity' | 'remainingQuantity'
>

interface InventoriesTableProps {
  inventories: Inventory[]
  isLoading: boolean
  sortBy: SortableInventoryField
  sortOrder: 'asc' | 'desc'
  onSort: (field: SortableInventoryField) => void
  onEdit: (inventory: Inventory) => void
  onHistory: (inventory: Inventory) => void
}

interface ActionMenuState {
  inventoryId: number
  top: number
  left: number
}

export function InventoriesTable({
  inventories,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onHistory,
}: InventoriesTableProps) {
  const [actionMenuState, setActionMenuState] =
    useState<ActionMenuState | null>(null)

  function getSortIndicator(field: SortableInventoryField): string {
    if (sortBy !== field) {
      return '-'
    }

    return sortOrder === 'asc' ? 'ASC' : 'DESC'
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[70rem] divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <Header label="Produit" />
              <Header label="Fournisseur" />
              <SortableHeader
                label="Quantité"
                indicator={getSortIndicator('quantity')}
                onSort={() => onSort('quantity')}
              />
              <SortableHeader
                label="Restant"
                indicator={getSortIndicator('remainingQuantity')}
                onSort={() => onSort('remainingQuantity')}
              />
              <Header label="Prix achat" />
              <Header label="Prix vente" />
              <Header label="Prix gros" />
              <Header label="Expiration" />
              <SortableHeader
                label="Créé le"
                indicator={getSortIndicator('createdAt')}
                onSort={() => onSort('createdAt')}
              />
              <SortableHeader
                label="Mis à jour"
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
              <EmptyRow message="Chargement des stocks..." />
            ) : inventories.length === 0 ? (
              <EmptyRow message="Aucune entrée en stock pour le moment." />
            ) : (
              inventories.map((inventory) => (
                <tr key={inventory.id} className="hover:bg-teal-50/60">
                  <td className="w-64 px-4 py-4 text-sm">
                    <p
                      className="max-w-56 truncate font-semibold text-slate-950"
                      title={
                        inventory.product?.name ??
                        `Produit #${inventory.productId}`
                      }
                    >
                      {inventory.product?.name ?? `Produit #${inventory.productId}`}
                    </p>
                    <p className="mt-1 max-w-56 truncate text-xs text-slate-500">
                      {displayValue(inventory.product?.reference)}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {inventory.supplier?.name ?? `Fournisseur #${inventory.supplierId}`}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-950">
                    {inventory.quantity}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-teal-700">
                    {inventory.remainingQuantity}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {formatPrice(inventory.purchasePrice)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {formatRoundedPrice(inventory.salePrice)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {formatRoundedPrice(inventory.wholesalePrice)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {inventory.expiredAt ? formatDateTime(inventory.expiredAt) : '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {formatDateTime(inventory.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {formatDateTime(inventory.updatedAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    <RowActionsMenu
                      position={
                        actionMenuState?.inventoryId === inventory.id
                          ? actionMenuState
                          : null
                      }
                      onToggle={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect()
                        const menuHeight = 84
                        const menuWidth = 160
                        const canOpenBelow =
                          rect.bottom + menuHeight + 8 < window.innerHeight

                        setActionMenuState((currentMenuState) =>
                          currentMenuState?.inventoryId === inventory.id
                            ? null
                            : {
                                inventoryId: inventory.id,
                                top: canOpenBelow
                                  ? rect.bottom + 4
                                  : rect.top - menuHeight - 4,
                                left: Math.max(8, rect.right - menuWidth),
                              },
                        )
                      }}
                      onEdit={() => {
                        setActionMenuState(null)
                        onEdit(inventory)
                      }}
                      onHistory={() => {
                        setActionMenuState(null)
                        onHistory(inventory)
                      }}
                    />
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
        colSpan={11}
        className="px-4 py-10 text-center text-sm font-medium text-slate-500"
      >
        {message}
      </td>
    </tr>
  )
}

interface RowActionsMenuProps {
  position: ActionMenuState | null
  onToggle: (event: MouseEvent<HTMLButtonElement>) => void
  onEdit: () => void
  onHistory: () => void
}

function RowActionsMenu({
  position,
  onToggle,
  onEdit,
  onHistory,
}: RowActionsMenuProps) {
  return (
    <div className="inline-flex justify-end">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-bold leading-none text-teal-700 transition hover:bg-teal-50"
        aria-label="Actions"
        title="Actions"
      >
        ...
      </button>
      {position
        ? createPortal(
            <div
              className="fixed z-50 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-left shadow-lg"
              style={{
                top: position.top,
                left: position.left,
              }}
            >
          <MenuAction label="Modifier" onClick={onEdit} />
          <MenuAction label="Historique" onClick={onHistory} />
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

interface MenuActionProps {
  label: string
  onClick: () => void
}

function MenuAction({ label, onClick }: MenuActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-teal-50 hover:text-teal-700"
    >
      {label}
    </button>
  )
}
