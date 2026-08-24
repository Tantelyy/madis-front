import { Fragment, useState } from 'react'
import { AppIcon } from '../../components/AppIcon'
import { formatDate } from '../../utils/displayFormatters'
import type { ListStockSummaryParams, StockSummary } from './stockApi'

type StockSortField = NonNullable<ListStockSummaryParams['sortBy']>

interface StockSummaryTableProps {
  products: StockSummary[]
  isLoading: boolean
  sortBy: StockSortField
  sortOrder: 'asc' | 'desc'
  onSort: (field: StockSortField) => void
  dangerThreshold: number
}

export function StockSummaryTable({
  products,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  dangerThreshold,
}: StockSummaryTableProps) {
  const [expandedProductIds, setExpandedProductIds] = useState<Set<number>>(
    () => new Set(),
  )

  function toggleProduct(productId: number): void {
    setExpandedProductIds((currentIds) => {
      const nextIds = new Set(currentIds)
      if (nextIds.has(productId)) {
        nextIds.delete(productId)
      } else {
        nextIds.add(productId)
      }
      return nextIds
    })
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th className="w-16 px-4 py-3" aria-label="Détail des lots" />
              <SortableHeader
                label="Produit"
                field="name"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                label="Référence"
                field="reference"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                label="Quantité restante"
                field="remainingQuantity"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <EmptyRow message="Chargement de l’état du stock..." />
            ) : products.length === 0 ? (
              <EmptyRow message="Aucun produit trouvé." />
            ) : (
              products.map((product) => {
                const isExpanded = expandedProductIds.has(product.productId)
                const isLowStock = product.remainingQuantity <= dangerThreshold

                return (
                  <Fragment key={product.productId}>
                    <tr className="hover:bg-teal-50/60">
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => toggleProduct(product.productId)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-teal-700 transition hover:bg-teal-100"
                          aria-expanded={isExpanded}
                          aria-label={`${isExpanded ? 'Masquer' : 'Afficher'} les lots de ${product.name}`}
                        >
                          <span
                            className="hidden"
                            aria-hidden="true"
                          >
                            ⌄
                          </span>
                          <AppIcon
                            name="chevron-down"
                            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-950">
                        {product.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {product.reference}
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-teal-700">
                        <span className="inline-flex items-center gap-2">
                          {product.remainingQuantity}
                          {isLowStock ? (
                            <span
                              title={`Stock proche du seuil : ${dangerThreshold}`}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700"
                              aria-label={`Attention : stock proche du seuil de ${dangerThreshold}`}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M12 3 2.8 20h18.4L12 3Z" />
                                <path d="M12 9v4" />
                                <path d="M12 17h.01" />
                              </svg>
                            </span>
                          ) : null}
                        </span>
                      </td>
                    </tr>
                    {isExpanded ? (
                      <tr className="bg-slate-50">
                        <td colSpan={4} className="px-6 py-4">
                          <LotDetails product={product} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function LotDetails({ product }: { product: StockSummary }) {
  if (product.lots.length === 0) {
    return <p className="text-sm text-slate-500">Aucun lot enregistré.</p>
  }

  return (
    <div>
      <p className="mb-3 text-sm font-bold text-slate-700">
        Lots de {product.name}
      </p>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2">Lot</th>
              <th className="px-4 py-2">Date d’expiration</th>
              <th className="px-4 py-2">Quantité restante</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {product.lots.map((lot) => (
              <tr key={lot.id}>
                <td className="px-4 py-2">#{lot.id}</td>
                <td className="px-4 py-2">
                  {lot.expiredAt
                    ? formatDate(lot.expiredAt)
                    : 'Non renseignée'}
                </td>
                <td className="px-4 py-2 font-semibold">
                  {lot.remainingQuantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface SortableHeaderProps {
  label: string
  field: StockSortField
  sortBy: StockSortField
  sortOrder: 'asc' | 'desc'
  onSort: (field: StockSortField) => void
}

function SortableHeader({
  label,
  field,
  sortBy,
  sortOrder,
  onSort,
}: SortableHeaderProps) {
  const indicator = sortBy === field ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'

  return (
    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-2 hover:text-teal-700"
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
        colSpan={4}
        className="px-4 py-10 text-center text-sm font-medium text-slate-500"
      >
        {message}
      </td>
    </tr>
  )
}
