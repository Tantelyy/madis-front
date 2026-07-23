import type { ReactNode } from 'react'
import { formatDateTime, formatPrice } from '../../utils/displayFormatters'
import {
  formatPaymentMethod,
  formatSaleStatus,
  saleStatusClassName,
} from './saleDisplay'
import type { Sale } from './salesApi'

export function SaleDetails({
  sale,
  actions,
}: {
  sale: Sale
  actions?: ReactNode
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Client" value={sale.customerName ?? '-'} />
        <Detail label="Contact" value={sale.customerContact ?? '-'} />
        <Detail label="Adresse" value={sale.customerAddress ?? '-'} />
        <Detail label="Vendeur" value={sale.seller?.userName ?? '-'} />
        <Detail label="Créée le" value={formatDateTime(sale.createdAt)} />
        <Detail
          label="Validée par"
          value={sale.validator?.userName ?? '-'}
        />
        <Detail
          label="Paiement"
          value={formatPaymentMethod(sale.paymentMethod)}
        />
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Statut</p>
          <span
            className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-bold ${saleStatusClassName(sale.status)}`}
          >
            {formatSaleStatus(sale.status)}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Tarif</th>
              <th className="px-4 py-3 text-right">Quantité</th>
              <th className="px-4 py-3 text-right">Offert</th>
              <th className="px-4 py-3 text-right">Prix unitaire</th>
              <th className="px-4 py-3 text-right">Sous-total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sale.cartDetails.map((detail) => (
              <tr key={detail.id}>
                <td className="px-4 py-4">
                  <p className="font-bold text-slate-950">
                    {detail.product.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {detail.product.reference}
                    {detail.specialOfferId ? ' · Promotion' : ''}
                  </p>
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {detail.wholesale ? 'Gros' : 'Détail'}
                </td>
                <td className="px-4 py-4 text-right">{detail.quantity}</td>
                <td className="px-4 py-4 text-right">
                  {detail.freeQuantity ?? 0}
                </td>
                <td className="px-4 py-4 text-right">
                  {formatPrice(detail.finalUnitPrice)}
                </td>
                <td className="px-4 py-4 text-right font-bold">
                  {formatPrice(
                    String(Number(detail.finalUnitPrice) * detail.quantity),
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50">
            <tr>
              <td colSpan={5} className="px-4 py-4 text-right font-bold">
                Total
              </td>
              <td className="px-4 py-4 text-right text-lg font-bold text-teal-800">
                {formatPrice(sale.totalPrice)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {sale.reason ? (
        <Detail label="Raison" value={sale.reason} />
      ) : null}
      {actions ? <div className="flex justify-end gap-3">{actions}</div> : null}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  )
}
