import { useRef, type ChangeEvent } from 'react'

interface CsvImportButtonProps {
  isImporting: boolean
  onSelect: (file: File) => Promise<void>
  onValidationError: (message: string) => void
}

export function CsvImportButton({
  isImporting,
  onSelect,
  onValidationError,
}: CsvImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''

    if (!file) {
      return
    }

    if (!file.name.toLocaleLowerCase('fr').endsWith('.csv')) {
      onValidationError('Seuls les fichiers CSV sont acceptés.')
      return
    }

    void onSelect(file)
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={handleFileChange}
      />
      <button
        type="button"
        disabled={isImporting}
        onClick={() => inputRef.current?.click()}
        className="rounded-lg border border-teal-700 bg-white px-4 py-3 text-sm font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isImporting ? 'Importation…' : 'Importer des données'}
      </button>
    </>
  )
}
