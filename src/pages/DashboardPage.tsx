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
  type DashboardFilter,
  type DashboardPeriod,
} from '../features/dashboard/dashboardDateRange'
import { DashboardPeriodFilter } from '../features/dashboard/DashboardPeriodFilter'
import { ProfitabilityChart } from '../features/dashboard/ProfitabilityChart'
import { SalesStockAnalysisSection } from '../features/dashboard/SalesStockAnalysisSection'
import { formatPrice } from '../utils/displayFormatters'

const GRANULARITY_CONTENT: Readonly<
  Record<
    ProfitabilityGranularity,
    { title: string; description: string }
  >
> = {
  HOUR: {
    title: 'Évolution par heure',
    description: 'Les opérations du jour sont regroupées par heure.',
  },
  WEEK: {
    title: 'Évolution par semaine',
    description: 'La période est regroupée en semaines pour garder le graphique lisible.',
  },
  MONTH: {
    title: 'Évolution par mois',
    description: 'La période longue est regroupée par mois.',
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

  function changePeriod(
    filter: DashboardFilter,
    nextPeriod: DashboardPeriod,
  ): void {
    setIsLoading(true)
    setErrorMessage('')
    setStatistics(null)
    setActiveFilter(filter)
    setPeriod(nextPeriod)
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
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-950">
          Suivi de la rentabilité des ventes
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Analysez les achats, le chiffre d’affaires et le bénéfice brut sur la
          période choisie.
        </p>
      </div>

      <DashboardPeriodFilter
        activeFilter={activeFilter}
        period={period}
        onChange={changePeriod}
      />

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
      ) : null}

      <SalesStockAnalysisSection />
    </section>
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
