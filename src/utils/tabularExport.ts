import { downloadBlob } from './fileDownload'

export interface ExportColumn<TRow> {
  header: string
  value: (row: TRow) => string | number
  width?: number
}

function escapeCsvCell(value: string | number): string {
  const text = String(value)
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function exportCsv<TRow>(
  rows: readonly TRow[],
  columns: readonly ExportColumn<TRow>[],
  fileName: string,
): void {
  const lines = [
    columns.map((column) => escapeCsvCell(column.header)).join(';'),
    ...rows.map((row) =>
      columns.map((column) => escapeCsvCell(column.value(row))).join(';'),
    ),
  ]
  const blob = new Blob([`\uFEFF${lines.join('\r\n')}`], {
    type: 'text/csv;charset=utf-8',
  })

  downloadBlob(blob, `${fileName}.csv`)
}

export async function exportPdf<TRow>(
  rows: readonly TRow[],
  columns: readonly ExportColumn<TRow>[],
  title: string,
  fileName: string,
): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const document = new jsPDF({ orientation: 'landscape', unit: 'mm' })
  const pageWidth = document.internal.pageSize.getWidth()
  const margin = 14
  const availableWidth = pageWidth - margin * 2
  const configuredWidth = columns.reduce(
    (total, column) => total + (column.width ?? 1),
    0,
  )
  const widths = columns.map(
    (column) => (availableWidth * (column.width ?? 1)) / configuredWidth,
  )
  const rowHeight = 8
  let y = 18

  function drawHeader(): void {
    document.setFont('helvetica', 'bold')
    document.setFontSize(15)
    document.text(title, margin, y)
    y += 10
    document.setFillColor(15, 118, 110)
    document.rect(margin, y - 5, availableWidth, rowHeight, 'F')
    document.setTextColor(255, 255, 255)
    document.setFontSize(9)
    let x = margin
    columns.forEach((column, index) => {
      document.text(column.header, x + 2, y, {
        maxWidth: widths[index] - 4,
      })
      x += widths[index]
    })
    document.setTextColor(15, 23, 42)
    document.setFont('helvetica', 'normal')
    y += rowHeight
  }

  drawHeader()
  rows.forEach((row, rowIndex) => {
    if (y + rowHeight > document.internal.pageSize.getHeight() - margin) {
      document.addPage()
      y = 18
      drawHeader()
    }
    if (rowIndex % 2 === 1) {
      document.setFillColor(248, 250, 252)
      document.rect(margin, y - 5, availableWidth, rowHeight, 'F')
    }
    let x = margin
    columns.forEach((column, columnIndex) => {
      document.text(String(column.value(row)), x + 2, y, {
        maxWidth: widths[columnIndex] - 4,
      })
      x += widths[columnIndex]
    })
    y += rowHeight
  })

  document.save(`${fileName}.pdf`)
}
