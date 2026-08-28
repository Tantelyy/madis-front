import { useEffect, useState } from 'react'
import { Modal } from '../../components/Modal'
import { formatDate, formatQuantity } from '../../utils/displayFormatters'
import {
  getProductForecast,
  type ProductForecast,
  type SalesStockItem,
} from './dashboardApi'

interface ProductForecastModalProps {
  product: SalesStockItem
  onClose: () => void
}

export function ProductForecastModal({
  product,
  onClose,
}: ProductForecastModalProps) {
  const [forecast, setForecast] = useState<ProductForecast | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    void getProductForecast(product.productId, controller.signal)
      .then((response) => {
        if (isActive) {
          setForecast(response)
        }
      })
      .catch((error: unknown) => {
        if (
          isActive &&
          !(error instanceof DOMException && error.name === 'AbortError')
        ) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Impossible de charger la prévision du produit.',
          )
        }
      })

    return () => {
      isActive = false
      controller.abort()
    }
  }, [product.productId])

  return (
    <Modal
      title={`Prévision · ${product.productName}`}
      onClose={onClose}
      errorMessage={errorMessage}
    >
      {!forecast && !errorMessage ? (
        <p className="py-8 text-center text-sm text-slate-500">
          Calcul de la prévision en cours...
        </p>
      ) : null}
      {forecast ? <ForecastDetails forecast={forecast} /> : null}
    </Modal>
  )
}

function ForecastDetails({ forecast }: { forecast: ProductForecast }) {
  const status = getForecastStatusContent(forecast)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-slate-950">{forecast.productName}</p>
          <p className="mt-1 text-sm text-slate-500">
            {forecast.productReference} · {forecast.productType}
          </p>
        </div>
        <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${status.className}`}>
          <span className="h-2 w-2 rounded-full bg-current" />
          {status.label}
        </span>
      </div>

      <p className="text-sm text-slate-500">
        Horizon de {forecast.forecastDays} jours · stock au{' '}
        {formatDate(forecast.asOfDate)}
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <ForecastMetric label="Stock actuel" value={forecast.currentStock} />
        <ForecastMetric
          label="Demande prévue · 7 j"
          value={forecast.totalPredictedDemand}
        />
        <ForecastMetric
          label="Stock prévu · J+7"
          value={forecast.remainingStockAfterHorizon}
        />
      </div>

      <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {forecast.status === 'OUT_OF_STOCK'
          ? 'Le produit est déjà en rupture de stock.'
          : forecast.status === 'STOCKOUT_EXPECTED'
            ? `Rupture estimée le ${formatDate(forecast.predictedStockoutDate)}.`
            : 'Le stock prévu couvre la demande sur cet horizon.'}
      </div>
    </div>
  )
}

function ForecastMetric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-bold tabular-nums text-slate-950">
        {formatQuantity(value)}
      </p>
    </article>
  )
}

function getForecastStatusContent(forecast: ProductForecast): {
  label: string
  className: string
} {
  switch (forecast.status) {
    case 'OUT_OF_STOCK':
      return { label: 'Déjà en rupture', className: 'bg-red-50 text-red-700' }
    case 'STOCKOUT_EXPECTED':
      return {
        label: `Rupture dans ${forecast.daysUntilStockout ?? 0} jour${forecast.daysUntilStockout === 1 ? '' : 's'}`,
        className: 'bg-amber-50 text-amber-700',
      }
    case 'SUFFICIENT_STOCK':
      return { label: 'Stock suffisant', className: 'bg-emerald-50 text-emerald-700' }
  }
}
