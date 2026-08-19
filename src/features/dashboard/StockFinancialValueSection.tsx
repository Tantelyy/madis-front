import { useEffect, useState } from 'react'
import { Alert } from '../../components/Alert'
import { formatPrice } from '../../utils/displayFormatters'
import {
  getStockFinancialValue,
  type StockFinancialValue,
  type StockValueByProductType,
} from './dashboardApi'

const STOCK_DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const PERCENTAGE_FORMATTER = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const BAR_COLOR_CLASSES = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-orange-500',
  'bg-violet-500',
  'bg-cyan-500',
] as const

export function StockFinancialValueSection() {
  const [stockValue, setStockValue] =
    useState<StockFinancialValue | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    void getStockFinancialValue(controller.signal)
      .then((response) => {
        if (isActive) {
          setStockValue(response)
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Impossible de charger la valeur financière du stock.',
          )
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
      controller.abort()
    }
  }, [])

  return (
    <section className="space-y-5 border-t border-slate-200 pt-7">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">
          Valeur financière du stock
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Valorisation du stock disponible à son coût d’achat.
        </p>
      </div>

      {errorMessage ? <Alert type="error" message={errorMessage} /> : null}

      <div className="grid gap-5 xl:grid-cols-[20rem_minmax(0,1fr)] xl:items-start">
        <article className="rounded-2xl border border-slate-200 bg-slate-100 p-5">
          <p className="text-sm font-medium text-slate-500">
            Valeur totale du stock
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-slate-950">
            {isLoading && !stockValue
              ? 'Chargement...'
              : formatPrice(stockValue?.totalValue ?? 0)}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Quantité actuelle × coût d’achat unitaire
          </p>
        </article>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-bold text-slate-950">
              Répartition par type de produit
            </h3>
            {stockValue ? (
              <p className="text-sm text-slate-500">
                Stock actuel ·{' '}
                {STOCK_DATE_FORMATTER.format(new Date(stockValue.stockAsOf))}
              </p>
            ) : null}
          </div>

          <StockValueBars stockValue={stockValue} isLoading={isLoading} />
        </div>
      </div>
    </section>
  )
}

function StockValueBars({
  stockValue,
  isLoading,
}: {
  stockValue: StockFinancialValue | null
  isLoading: boolean
}) {
  if (isLoading && !stockValue) {
    return (
      <p className="py-10 text-center text-sm text-slate-500">
        Chargement de la répartition...
      </p>
    )
  }

  if (!stockValue || stockValue.byProductType.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-500">
        Aucun stock disponible à valoriser.
      </p>
    )
  }

  return (
    <div className="mt-5 space-y-6">
      {stockValue.byProductType.map((item, index) => (
        <StockValueBar
          key={item.productTypeId}
          item={item}
          colorClassName={BAR_COLOR_CLASSES[index % BAR_COLOR_CLASSES.length]}
        />
      ))}
    </div>
  )
}

function StockValueBar({
  item,
  colorClassName,
}: {
  item: StockValueByProductType
  colorClassName: string
}) {
  const percentage = Number(item.percentage)
  const barWidth = percentage === 0 ? 0 : Math.max(2, percentage)

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-medium text-slate-700">{item.productType}</p>
        <p className="shrink-0 font-semibold tabular-nums text-slate-950">
          {formatPrice(item.value)}
        </p>
      </div>
      <div
        className="mt-2 h-3.5 overflow-hidden rounded-full bg-slate-200"
        role="meter"
        aria-label={`${item.productType} : ${PERCENTAGE_FORMATTER.format(percentage)} % de la valeur totale`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <div
          className={`h-full rounded-full ${colorClassName}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <p className="mt-1 text-sm text-slate-400">
        {PERCENTAGE_FORMATTER.format(percentage)} % de la valeur totale
      </p>
    </div>
  )
}
