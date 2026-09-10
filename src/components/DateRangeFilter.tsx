interface DateRangeFilterProps {
  idPrefix: string
  startDate: string
  endDate: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onClear: () => void
}

export function DateRangeFilter({
  idPrefix,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
}: DateRangeFilterProps) {
  const inputClassName =
    'mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100'

  return (
    <div className="grid justify-start gap-4 sm:grid-cols-2 lg:grid-cols-[12rem_12rem_max-content] lg:items-end">
      <div>
        <label
          htmlFor={`${idPrefix}-start-date`}
          className="block text-sm font-medium text-slate-700"
        >
          Date de début
        </label>
        <input
          id={`${idPrefix}-start-date`}
          type="date"
          value={startDate}
          max={endDate || undefined}
          onChange={(event) => onStartDateChange(event.target.value)}
          className={inputClassName}
        />
      </div>
      <div>
        <label
          htmlFor={`${idPrefix}-end-date`}
          className="block text-sm font-medium text-slate-700"
        >
          Date de fin
        </label>
        <input
          id={`${idPrefix}-end-date`}
          type="date"
          value={endDate}
          min={startDate || undefined}
          onChange={(event) => onEndDateChange(event.target.value)}
          className={inputClassName}
        />
      </div>
      <button
        type="button"
        onClick={onClear}
        disabled={!startDate && !endDate}
        className="justify-self-start whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2 lg:col-span-1"
      >
        Réinitialiser les dates
      </button>
    </div>
  )
}
