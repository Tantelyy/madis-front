import { formatDateTime, formatUser } from '../../utils/displayFormatters'
import type { Product } from './productsApi'

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      <DetailItem label="Nom" value={product.name} isStrong />
      <DetailItem label="Référence" value={product.reference} />
      <DetailItem label="Créé le" value={formatDateTime(product.createdAt)} />
      <DetailItem label="Mis à jour le" value={formatDateTime(product.updatedAt)} />
      <DetailItem label="Créé par" value={formatUser(product.createdByUser)} />
    </dl>
  )
}

interface DetailItemProps {
  label: string
  value: string
  isStrong?: boolean
}

function DetailItem({ label, value, isStrong = false }: DetailItemProps) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm ${
          isStrong ? 'font-semibold text-slate-950' : 'text-slate-700'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}
