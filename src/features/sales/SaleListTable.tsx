import type { ReactNode } from 'react'
import { formatDateTime, formatPrice } from '../../utils/displayFormatters'
import { InvoiceDownloadButton } from './InvoiceDownloadButton'
import {
  formatSaleStatus,
  saleStatusClassName,
} from './saleDisplay'
import type { Sale } from './salesApi'

interface SaleListTableProps {
  sales: Sale[]
  isLoading: boolean
  onSelect: (sale: Sale) => void
  renderActions?: (sale: Sale) => ReactNode
}

export function SaleListTable({
  sales,
  isLoading,
  onSelect,
  renderActions,
}: SaleListTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Vente</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Vendeur</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                Chargement...
              </td>
            </tr>
          ) : sales.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                Aucune vente trouvée.
              </td>
            </tr>
          ) : (
            sales.map((sale) => (
              <tr
                key={sale.id}
                onClick={() => onSelect(sale)}
                className="cursor-pointer transition hover:bg-teal-50"
              >
                <td className="px-4 py-4 font-bold text-slate-950">
                  N° {sale.id}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                  {formatDateTime(sale.createdAt)}
                </td>
                <td className="px-4 py-4 text-slate-700">
                  {sale.customerName ?? '-'}
                </td>
                <td className="px-4 py-4 text-slate-700">
                  {sale.seller?.userName ?? '-'}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${saleStatusClassName(sale.status)}`}
                  >
                    {formatSaleStatus(sale.status)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-right font-bold text-slate-950">
                  {formatPrice(sale.totalPrice)}
                </td>
                <td
                  className="px-4 py-4"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="flex justify-end gap-2">
                    {sale.status === 'PAID' ? (
                      <InvoiceDownloadButton sale={sale} />
                    ) : null}
                    {renderActions?.(sale)}
                    <button
                      type="button"
                      onClick={() => onSelect(sale)}
                      className="rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Voir les détails
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
