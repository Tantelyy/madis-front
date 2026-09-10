import { useState } from 'react'
import { exportCsv, exportPdf, type ExportColumn } from '../utils/tabularExport'
import { ExportModal, type ExportFormat, type ExportScope } from './ExportModal'

interface TabularExportButtonProps<TRow> {
  currentRows: readonly TRow[]
  columns: readonly ExportColumn<TRow>[]
  title: string
  fileNamePrefix: string
  isLoading: boolean
  loadAllRows: () => Promise<TRow[]>
}

export function TabularExportButton<TRow>({
  currentRows,
  columns,
  title,
  fileNamePrefix,
  isLoading,
  loadAllRows,
}: TabularExportButtonProps<TRow>) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  async function handleExport(
    format: ExportFormat,
    scope: ExportScope,
  ): Promise<void> {
    setIsExporting(true)
    setErrorMessage('')

    try {
      const rows = scope === 'current' ? currentRows : await loadAllRows()
      const fileName = `${fileNamePrefix}-${new Date().toISOString().slice(0, 10)}`

      if (format === 'csv') {
        exportCsv(rows, columns, fileName)
      } else {
        await exportPdf(rows, columns, title, fileName)
      }

      setIsModalOpen(false)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : `Impossible d’exporter « ${title} ».`,
      )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setErrorMessage('')
          setIsModalOpen(true)
        }}
        disabled={isLoading || currentRows.length === 0}
        className="rounded-lg border border-teal-700 bg-white px-4 py-3 text-sm font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Exporter
      </button>

      {isModalOpen ? (
        <ExportModal
          title={title}
          isExporting={isExporting}
          errorMessage={errorMessage}
          onClose={() => setIsModalOpen(false)}
          onExport={handleExport}
        />
      ) : null}
    </>
  )
}
