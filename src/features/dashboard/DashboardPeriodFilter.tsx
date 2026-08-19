import { useState } from 'react'
import {
  createPresetPeriod,
  formatDashboardPeriod,
  type DashboardFilter,
  type DashboardPeriod,
} from './dashboardDateRange'
import { CustomPeriodModal } from './CustomPeriodModal'

interface DashboardPeriodFilterProps {
  activeFilter: DashboardFilter
  period: DashboardPeriod
  onChange: (filter: DashboardFilter, period: DashboardPeriod) => void
  ariaLabel?: string
}

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

export function DashboardPeriodFilter({
  activeFilter,
  period,
  onChange,
  ariaLabel = 'Filtrer la période',
}: DashboardPeriodFilterProps) {
  const [isCustomModalOpen, setIsCustomModalOpen] =
    useState<boolean>(false)

  function selectFilter(filter: DashboardFilter): void {
    if (filter === 'CUSTOM') {
      setIsCustomModalOpen(true)
      return
    }

    onChange(filter, createPresetPeriod(filter))
  }

  function applyCustomPeriod(customPeriod: DashboardPeriod): void {
    onChange('CUSTOM', customPeriod)
    setIsCustomModalOpen(false)
  }

  return (
    <>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2" aria-label={ariaLabel}>
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

      {isCustomModalOpen ? (
        <CustomPeriodModal
          initialPeriod={period}
          onApply={applyCustomPeriod}
          onClose={() => setIsCustomModalOpen(false)}
        />
      ) : null}
    </>
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
