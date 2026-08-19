import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/Modal'
import {
  createShortcutPeriod,
  formatDateInput,
  getInclusivePeriodEnd,
  parseInclusiveDatePeriod,
  type DashboardPeriod,
  type DashboardShortcut,
} from './dashboardDateRange'

interface CustomPeriodModalProps {
  initialPeriod: DashboardPeriod
  onApply: (period: DashboardPeriod) => void
  onClose: () => void
}

const SHORTCUTS: readonly {
  value: DashboardShortcut
  label: string
}[] = [
  { value: 'YESTERDAY', label: 'Hier' },
  { value: 'DAY_BEFORE_YESTERDAY', label: 'Avant-hier' },
  { value: 'LAST_WEEK', label: 'Semaine dernière' },
  { value: 'LAST_MONTH', label: 'Mois dernier' },
]

export function CustomPeriodModal({
  initialPeriod,
  onApply,
  onClose,
}: CustomPeriodModalProps) {
  const [fromValue, setFromValue] = useState<string>(() =>
    formatDateInput(initialPeriod.from),
  )
  const [toValue, setToValue] = useState<string>(() =>
    formatDateInput(getInclusivePeriodEnd(initialPeriod)),
  )
  const [errorMessage, setErrorMessage] = useState<string>('')

  function selectShortcut(shortcut: DashboardShortcut): void {
    const period = createShortcutPeriod(shortcut)
    setFromValue(formatDateInput(period.from))
    setToValue(formatDateInput(getInclusivePeriodEnd(period)))
    setErrorMessage('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const period = parseInclusiveDatePeriod(fromValue, toValue)

    if (!period) {
      setErrorMessage(
        'Sélectionnez des dates valides, avec une date de fin postérieure ou égale à la date de début.',
      )
      return
    }

    onApply(period)
  }

  return (
    <Modal
      title="Période personnalisée"
      onClose={onClose}
      size="md"
      errorMessage={errorMessage}
    >
      <form className="space-y-6 bg-white" onSubmit={handleSubmit}>
        <fieldset>
          <legend className="text-sm font-semibold text-slate-600">
            Raccourcis
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {SHORTCUTS.map((shortcut) => (
              <button
                key={shortcut.value}
                type="button"
                onClick={() => selectShortcut(shortcut.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
              >
                {shortcut.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            <span>Du</span>
            <input
              type="date"
              required
              value={fromValue}
              onChange={(event) => {
                setFromValue(event.target.value)
                setErrorMessage('')
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            <span>Au</span>
            <input
              type="date"
              required
              value={toValue}
              onChange={(event) => {
                setToValue(event.target.value)
                setErrorMessage('')
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
          >
            Appliquer
          </button>
        </div>
      </form>
    </Modal>
  )
}
