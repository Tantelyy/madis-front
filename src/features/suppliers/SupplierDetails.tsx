import { displayValue, formatDateTime, formatUser } from '../../utils/displayFormatters'
import type { Supplier } from './suppliersApi'

interface SupplierDetailsProps {
  supplier: Supplier
}

export function SupplierDetails({ supplier }: SupplierDetailsProps) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      <DetailItem label="Nom" value={supplier.name} isStrong />
      <DetailItem label="Email" value={displayValue(supplier.email)} />
      <DetailItem label="Téléphone" value={displayValue(supplier.phone)} />
      <DetailItem label="Adresse" value={displayValue(supplier.address)} />
      <DetailItem label="Créé le" value={formatDateTime(supplier.createdAt)} />
      <DetailItem
        label="Mis à jour le"
        value={formatDateTime(supplier.updatedAt)}
      />
      <DetailItem label="Créé par" value={formatUser(supplier.createdByUser)} />
      <DetailItem
        label="Mis à jour par"
        value={formatUser(supplier.updatedByUser)}
      />
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
