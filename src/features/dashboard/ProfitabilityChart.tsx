import type { ProfitabilityPoint } from './dashboardApi'

interface ProfitabilityChartProps {
  points: readonly ProfitabilityPoint[]
}

type ChartMetricKey =
  | 'purchaseAmount'
  | 'revenue'
  | 'costOfGoodsSold'
  | 'profit'

const CHART_METRICS: readonly {
  key: ChartMetricKey
  label: string
  color: string
}[] = [
  { key: 'purchaseAmount', label: 'Achats', color: '#3b82f6' },
  { key: 'revenue', label: 'CA', color: '#49ad5a' },
  { key: 'costOfGoodsSold', label: 'Coût vendu', color: '#f2762e' },
  { key: 'profit', label: 'Bénéfice', color: '#f5b82e' },
]

const CHART_HEIGHT = 360
const CHART_TOP = 20
const CHART_BOTTOM = 58
const CHART_LEFT = 76
const CHART_RIGHT = 24
const Y_TICK_COUNT = 4

export function ProfitabilityChart({ points }: ProfitabilityChartProps) {
  if (points.length === 0) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
        Aucune opération sur cette période.
      </div>
    )
  }

  const width = Math.max(760, points.length * 72)
  const plotWidth = width - CHART_LEFT - CHART_RIGHT
  const plotHeight = CHART_HEIGHT - CHART_TOP - CHART_BOTTOM
  const rawMaximum = Math.max(
    ...points.flatMap((point) =>
      CHART_METRICS.map((metric) => Number(point[metric.key])),
    ),
    0,
  )
  const maximum = getRoundedMaximum(rawMaximum)
  const getX = (index: number): number =>
    points.length === 1
      ? CHART_LEFT + plotWidth / 2
      : CHART_LEFT + (index * plotWidth) / (points.length - 1)
  const getY = (value: number): number =>
    CHART_TOP + plotHeight - (value / maximum) * plotHeight

  return (
    <div>
      <div className="mb-4 flex flex-wrap justify-end gap-x-5 gap-y-2 text-sm text-slate-500">
        {CHART_METRICS.map((metric) => (
          <span key={metric.key} className="inline-flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: metric.color }}
              aria-hidden="true"
            />
            {metric.label}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
          className="h-auto min-w-[760px]"
          role="img"
          aria-label="Graphique de l'évolution de la rentabilité"
        >
          {Array.from({ length: Y_TICK_COUNT + 1 }, (_, index) => {
            const value = maximum - (maximum * index) / Y_TICK_COUNT
            const y = CHART_TOP + (plotHeight * index) / Y_TICK_COUNT

            return (
              <g key={value}>
                <line
                  x1={CHART_LEFT}
                  x2={width - CHART_RIGHT}
                  y1={y}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                <text
                  x={CHART_LEFT - 12}
                  y={y + 4}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="12"
                >
                  {formatCompactAmount(value)}
                </text>
              </g>
            )
          })}

          {CHART_METRICS.map((metric) => {
            const coordinates = points.map((point, index) => ({
              x: getX(index),
              y: getY(Number(point[metric.key])),
            }))

            return (
              <g key={metric.key}>
                {coordinates.length > 1 ? (
                  <polyline
                    points={coordinates
                      .map(({ x, y }) => `${x},${y}`)
                      .join(' ')}
                    fill="none"
                    stroke={metric.color}
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                ) : null}
                {coordinates.map(({ x, y }, index) => (
                  <circle
                    key={points[index].key}
                    cx={x}
                    cy={y}
                    r="5"
                    fill={metric.color}
                    stroke="white"
                    strokeWidth="2"
                  >
                    <title>
                      {`${points[index].label} — ${metric.label} : ${formatAmount(Number(points[index][metric.key]))}`}
                    </title>
                  </circle>
                ))}
              </g>
            )
          })}

          {points.map((point, index) => (
            <text
              key={point.key}
              x={getX(index)}
              y={CHART_HEIGHT - 18}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="12"
            >
              {point.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  )
}

function getRoundedMaximum(value: number): number {
  if (value <= 0) {
    return 1
  }

  const magnitude = 10 ** Math.floor(Math.log10(value))
  return Math.ceil(value / magnitude) * magnitude
}

function formatCompactAmount(value: number): string {
  if (value === 0) {
    return '0'
  }

  return new Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function formatAmount(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(value)} Ar`
}
