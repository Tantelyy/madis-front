import { useEffect, useState, type ReactNode } from 'react'
import { Alert } from '../components/Alert'
import {
  getProfitabilityStatistics,
  type ProfitabilityAmounts,
  type ProfitabilityGranularity,
  type ProfitabilityStatistics,
} from '../features/dashboard/dashboardApi'
import {
  createPresetPeriod,
  formatDashboardPeriod,
  type DashboardFilter,
  type DashboardPeriod,
  type DashboardPreset,
} from '../features/dashboard/dashboardDateRange'
import { CustomPeriodModal } from '../features/dashboard/CustomPeriodModal'
import { ProfitabilityChart } from '../features/dashboard/ProfitabilityChart'
import { formatPrice } from '../utils/displayFormatters'

const FILTERS: readonly {
  value: DashboardFilter
  label: string
}[] = [
  { value: 'TODAY', label: "Aujourd'hui" },
  { value: 'WEEK', label: 'Cette semaine' },
  { value: 'MONTH', label: 'Ce mois' },
  { value: 'YEAR', label: 'Cette année' },
  { value: 'CUSTOM', label: 'Personnalisée' },
]

const GRANULARITY_CONTENT: Readonly<
  Record<
    ProfitabilityGranularity,
    { title: string; description: string; column: string }
  >
> = {
  HOUR: {
    title: 'Évolution par heure',
    description: 'Les opérations du jour sont regroupées par heure.',
    column: 'Heure',
  },
  WEEK: {
    title: 'Évolution par semaine',
    description: 'La période est regroupée en semaines pour garder le graphique lisible.',
    column: 'Semaine',
  },
  MONTH: {
    title: 'Évolution par mois',
    description: 'La période longue est regroupée par mois.',
    column: 'Mois',
  },
}

interface MetricDefinition {
  key: keyof ProfitabilityAmounts
  label: string
  description: string
}

const METRICS: readonly MetricDefinition[] = [
  {
    key: 'purchaseAmount',
    label: 'Montant des achats',
    description: 'Entrées en stock de la période',
  },
  {
    key: 'revenue',
    label: "Chiffre d'affaires",
    description: 'Total des ventes de la période',
  },
  {
    key: 'costOfGoodsSold',
    label: 'Coût des produits vendus',
    description: "Coût d'achat des articles vendus",
  },
  {
    key: 'profit',
    label: 'Bénéfice brut',
    description: 'CA − coût des produits vendus',
  },
]

export function DashboardPage() {
  const [activeFilter, setActiveFilter] =
    useState<DashboardFilter>('MONTH')
  const [period, setPeriod] = useState<DashboardPeriod>(() =>
    createPresetPeriod('MONTH'),
  )
  const [statistics, setStatistics] =
    useState<ProfitabilityStatistics | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isCustomModalOpen, setIsCustomModalOpen] =
    useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    void getProfitabilityStatistics(period, controller.signal)
      .then((response) => {
        if (isActive) {
          setStatistics(response)
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
              : 'Impossible de charger les statistiques.',
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
  }, [period])

  function selectFilter(filter: DashboardFilter): void {
    if (filter === 'CUSTOM') {
      setIsCustomModalOpen(true)
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setStatistics(null)
    setActiveFilter(filter)
    setPeriod(createPresetPeriod(filter as DashboardPreset))
  }

  function applyCustomPeriod(customPeriod: DashboardPeriod): void {
    setIsLoading(true)
    setErrorMessage('')
    setStatistics(null)
    setActiveFilter('CUSTOM')
    setPeriod(customPeriod)
    setIsCustomModalOpen(false)
  }

  const granularityContent = statistics
    ? GRANULARITY_CONTENT[statistics.period.granularity]
    : null

  return (
    <section className="space-y-7">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          Accueil
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">
          Suivi de la rentabilité des ventes
        </p>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2" aria-label="Filtrer la période">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.value

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => selectFilter(filter.value)}
                aria-pressed={isActive}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-teal-100 ${
                  isActive
                    ? 'border-slate-950 bg-slate-950 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50'
                }`}
              >
                {filter.value === 'CUSTOM' ? <CalendarIcon /> : null}
                {filter.label}
              </button>
            )
          })}
        </div>
        <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
          <CalendarIcon />
          {formatDashboardPeriod(period, activeFilter)}
        </p>
      </div>

      {errorMessage ? <Alert type="error" message={errorMessage} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {METRICS.map((metric) => (
          <article
            key={metric.key}
            className="min-h-40 rounded-2xl border border-slate-200 bg-slate-100 p-5"
          >
            <div className="flex items-start gap-3 text-slate-700">
              <MetricIcon metric={metric.key} />
              <h2 className="text-base font-semibold">{metric.label}</h2>
            </div>
            <p
              className={`mt-3 text-2xl font-bold tabular-nums ${
                metric.key === 'profit' &&
                Number(statistics?.totals.profit ?? 0) < 0
                  ? 'text-red-700'
                  : 'text-slate-950'
              }`}
            >
              {isLoading && !statistics
                ? 'Chargement...'
                : formatPrice(statistics?.totals[metric.key] ?? 0)}
            </p>
            <p className="mt-2 text-sm leading-5 text-slate-500">
              {metric.description}
            </p>
          </article>
        ))}
      </div>

      {statistics && granularityContent ? (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                {granularityContent.title}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {granularityContent.description}
              </p>
            </div>
            <div className="mt-5">
              <ProfitabilityChart points={statistics.points} />
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="px-5 pb-3 pt-5 sm:px-6">
              <h2 className="text-xl font-bold text-slate-950">
                Détail de vérification
              </h2>
            </div>
            <div className="overflow-x-auto px-5 pb-5 sm:px-6">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-700">
                    <th className="py-3 pr-4 font-semibold">
                      {granularityContent.column}
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">Achats</th>
                    <th className="px-4 py-3 text-right font-semibold">CA</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Coût vendu
                    </th>
                    <th className="py-3 pl-4 text-right font-semibold">
                      Bénéfice brut
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.points.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-slate-500"
                      >
                        Aucune opération sur cette période.
                      </td>
                    </tr>
                  ) : (
                    statistics.points.map((point) => (
                      <tr
                        key={point.key}
                        className="border-b border-slate-100 text-slate-700"
                      >
                        <td className="py-3 pr-4">{point.label}</td>
                        <AmountCell value={point.purchaseAmount} />
                        <AmountCell value={point.revenue} />
                        <AmountCell value={point.costOfGoodsSold} />
                        <AmountCell value={point.profit} isProfit />
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-300 font-bold text-slate-950">
                    <td className="py-4 pr-4">Total</td>
                    <AmountCell value={statistics.totals.purchaseAmount} />
                    <AmountCell value={statistics.totals.revenue} />
                    <AmountCell value={statistics.totals.costOfGoodsSold} />
                    <AmountCell value={statistics.totals.profit} isProfit />
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </>
      ) : null}

      {isCustomModalOpen ? (
        <CustomPeriodModal
          initialPeriod={period}
          onApply={applyCustomPeriod}
          onClose={() => setIsCustomModalOpen(false)}
        />
      ) : null}
    </section>
  )
}

function AmountCell({
  value,
  isProfit = false,
}: {
  value: string
  isProfit?: boolean
}) {
  const isNegativeProfit = isProfit && Number(value) < 0

  return (
    <td
      className={`px-4 py-3 text-right tabular-nums last:pr-0 ${
        isNegativeProfit ? 'text-red-700' : ''
      }`}
    >
      {formatPrice(value)}
    </td>
  )
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  )
}

function MetricIcon({ metric }: { metric: keyof ProfitabilityAmounts }) {
  const paths: Readonly<Record<keyof ProfitabilityAmounts, ReactNode>> = {
    purchaseAmount: <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L20.5 8H6M10 20h.01M17 20h.01" />,
    revenue: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M7 12h.01M17 12h.01M12 10v4" /></>,
    costOfGoodsSold: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v9" /></>,
    profit: <><path d="m4 16 5-5 4 3 7-8" /><path d="M15 6h5v5" /></>,
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="mt-0.5 h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[metric]}
    </svg>
  )
}
