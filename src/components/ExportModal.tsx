import { useState, type FormEvent } from 'react'
import { Modal } from './Modal'

export type ExportFormat = 'csv' | 'pdf'
export type ExportScope = 'current' | 'all'

interface ExportModalProps {
  title: string
  isExporting: boolean
  errorMessage: string
  onClose: () => void
  onExport: (format: ExportFormat, scope: ExportScope) => Promise<void>
}

export function ExportModal({
  title,
  isExporting,
  errorMessage,
  onClose,
  onExport,
}: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [scope, setScope] = useState<ExportScope>('current')

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    void onExport(format, scope)
  }

  return (
    <Modal
      title={`Exporter — ${title}`}
      onClose={onClose}
      size="sm"
      errorMessage={errorMessage}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <fieldset>
          <legend className="text-sm font-bold text-slate-700">Format</legend>
          <div className="mt-2 flex gap-4">
            <Choice
              label="CSV"
              name="format"
              checked={format === 'csv'}
              onChange={() => setFormat('csv')}
            />
            <Choice
              label="PDF"
              name="format"
              checked={format === 'pdf'}
              onChange={() => setFormat('pdf')}
            />
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-bold text-slate-700">Données</legend>
          <div className="mt-2 space-y-2">
            <Choice
              label="Page actuelle"
              name="scope"
              checked={scope === 'current'}
              onChange={() => setScope('current')}
            />
            <Choice
              label="Toutes les pages filtrées"
              name="scope"
              checked={scope === 'all'}
              onChange={() => setScope('all')}
            />
          </div>
        </fieldset>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="rounded-lg border border-slate-200 px-4 py-3 font-semibold text-slate-600"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isExporting}
            className="rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white disabled:bg-teal-300"
          >
            {isExporting ? 'Export en cours...' : 'Exporter'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

interface ChoiceProps {
  label: string
  name: string
  checked: boolean
  onChange: () => void
}

function Choice({ label, name, checked, onChange }: ChoiceProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-teal-700"
      />
      {label}
    </label>
  )
}
