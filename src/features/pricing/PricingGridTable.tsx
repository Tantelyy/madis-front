import { memo } from 'react'
import type { PricingRule } from './pricingApi'
import {
  calculatePricingRule,
  type EditablePricingRule,
  type EditablePricingRuleField,
} from './pricingRules'
import { formatDecimal, formatPercent, formatPrice } from './pricingFormatters'

const EDITABLE_FIELDS = [
  'minPurchasePrice',
  'maxPurchasePrice',
  'retailMarginPercent',
  'wholesaleMarginPercent',
] as const satisfies readonly EditablePricingRuleField[]

interface PricingGridTableProps {
  pricingRules: readonly PricingRule[]
  editablePricingRules: readonly EditablePricingRule[]
  isEditing: boolean
  onEditableRuleChange: (
    key: string,
    field: EditablePricingRuleField,
    value: string,
  ) => void
  onAddRule: (afterIndex: number) => void
  onDeleteRule: (key: string) => void
}

export function PricingGridTable({
  pricingRules,
  editablePricingRules,
  isEditing,
  onEditableRuleChange,
  onAddRule,
  onDeleteRule,
}: PricingGridTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[80rem] table-fixed border-collapse text-sm xl:w-full">
          <colgroup>
            <col className="w-36" />
            <col className="w-36" />
            <col className="w-40" />
            <col className="w-40" />
            <col className="w-40" />
            <col className="w-40" />
            <col className="w-40" />
            <col className="w-40" />
            {isEditing ? <col className="w-28" /> : null}
          </colgroup>
          <thead className="sticky top-0 z-10 bg-slate-100 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="border-b border-slate-200 px-4 py-3">
                Prix min (Ariary)
              </th>
              <th className="border-b border-slate-200 px-4 py-3">
                Prix max (Ariary)
              </th>
              <th className="border-b border-slate-200 px-4 py-3">
                Marge détail
              </th>
              <th className="border-b border-slate-200 px-4 py-3">
                Marge en gros
              </th>
              <th className="border-b border-slate-200 px-4 py-3">
                Moyenne détail
              </th>
              <th className="border-b border-slate-200 px-4 py-3">
                Moyenne en gros
              </th>
              <th className="border-b border-slate-200 px-4 py-3">
                Prix détail (Ariary)
              </th>
              <th className="border-b border-slate-200 px-4 py-3">
                Prix en gros (Ariary)
              </th>
              {isEditing ? (
                <th className="border-b border-slate-200 px-4 py-3">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isEditing
              ? editablePricingRules.map((pricingRule, index) => (
                  <EditablePricingRuleRow
                    key={pricingRule.key}
                    pricingRule={pricingRule}
                    canDelete={editablePricingRules.length > 1}
                    rowIndex={index}
                    onEditableRuleChange={onEditableRuleChange}
                    onAddRule={onAddRule}
                    onDeleteRule={onDeleteRule}
                  />
                ))
              : pricingRules.map((pricingRule) => (
                  <ReadOnlyPricingRuleRow
                    key={pricingRule.id}
                    pricingRule={pricingRule}
                  />
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface EditablePricingRuleRowProps {
  pricingRule: EditablePricingRule
  canDelete: boolean
  rowIndex: number
  onEditableRuleChange: (
    key: string,
    field: EditablePricingRuleField,
    value: string,
  ) => void
  onAddRule: (afterIndex: number) => void
  onDeleteRule: (key: string) => void
}

const EditablePricingRuleRow = memo(function EditablePricingRuleRow({
  pricingRule,
  canDelete,
  rowIndex,
  onEditableRuleChange,
  onAddRule,
  onDeleteRule,
}: EditablePricingRuleRowProps) {
  const calculatedPricingRule = calculatePricingRule(pricingRule)

  return (
    <tr className="transition">
      {EDITABLE_FIELDS.map((field) => (
        <td key={field} className="px-3 py-2">
          <input
            type="number"
            step={
              field === 'minPurchasePrice' || field === 'maxPurchasePrice'
                ? '1'
                : '0.01'
            }
            min="0"
            value={pricingRule[field]}
            onChange={(event) =>
              onEditableRuleChange(
                pricingRule.key,
                field,
                event.target.value,
              )
            }
            className="block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          />
        </td>
      ))}
      <td className="px-4 py-3 text-slate-700">
        {Number.isFinite(calculatedPricingRule.retailAverage)
          ? formatDecimal(calculatedPricingRule.retailAverage)
          : '-'}
      </td>
      <td className="px-4 py-3 text-slate-700">
        {Number.isFinite(calculatedPricingRule.wholesaleAverage)
          ? formatDecimal(calculatedPricingRule.wholesaleAverage)
          : '-'}
      </td>
      <td className="px-4 py-3 font-semibold text-slate-950">
        {Number.isFinite(calculatedPricingRule.retailPrice)
          ? formatPrice(calculatedPricingRule.retailPrice)
          : '-'}
      </td>
      <td className="px-4 py-3 font-semibold text-slate-950">
        {Number.isFinite(calculatedPricingRule.wholesalePrice)
          ? formatPrice(calculatedPricingRule.wholesalePrice)
          : '-'}
      </td>
      <td className="px-3 py-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onAddRule(rowIndex)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-bold text-teal-700 transition hover:bg-teal-50"
            aria-label="Ajouter une ligne"
            title="Ajouter une ligne"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => onDeleteRule(pricingRule.key)}
            disabled={!canDelete}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300"
            aria-label="Supprimer la ligne"
            title="Supprimer la ligne"
          >
            -
          </button>
        </div>
      </td>
    </tr>
  )
})

interface ReadOnlyPricingRuleRowProps {
  pricingRule: PricingRule
}

const ReadOnlyPricingRuleRow = memo(function ReadOnlyPricingRuleRow({
  pricingRule,
}: ReadOnlyPricingRuleRowProps) {
  const retailPrice =
    pricingRule.maxPurchasePrice + Number(pricingRule.retailAverage)
  const wholesalePrice =
    pricingRule.maxPurchasePrice + Number(pricingRule.wholesaleAverage)

  return (
    <tr className="transition hover:bg-teal-50/60">
      <td className="px-4 py-3 font-medium text-slate-900">
        {formatPrice(pricingRule.minPurchasePrice)}
      </td>
      <td className="px-4 py-3 font-medium text-slate-900">
        {formatPrice(pricingRule.maxPurchasePrice)}
      </td>
      <td className="px-4 py-3 text-slate-700">
        {formatPercent(pricingRule.retailMarginPercent)}
      </td>
      <td className="px-4 py-3 text-slate-700">
        {formatPercent(pricingRule.wholesaleMarginPercent)}
      </td>
      <td className="px-4 py-3 text-slate-700">
        {formatDecimal(pricingRule.retailAverage)}
      </td>
      <td className="px-4 py-3 text-slate-700">
        {formatDecimal(pricingRule.wholesaleAverage)}
      </td>
      <td className="px-4 py-3 font-semibold text-slate-950">
        {formatPrice(retailPrice)}
      </td>
      <td className="px-4 py-3 font-semibold text-slate-950">
        {formatPrice(wholesalePrice)}
      </td>
    </tr>
  )
})
