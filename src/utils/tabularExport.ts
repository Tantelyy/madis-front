import { downloadBlob } from './fileDownload'

export interface ExportColumn<TRow> {
  header: string
  value: (row: TRow) => string | number
  pdfValue?: (row: TRow) => string | number
  width?: number
}

export function formatPdfAriary(value: string | number): string {
  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return '-'
  }

  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })
    .format(amount)
    .replace(/[\u00A0\u202F]/gu, ' ')
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
  const minimumRowHeight = 8
  const lineHeight = 3.5
  let y = 18

  function splitCell(value: string | number, width: number): string[] {
    return document.splitTextToSize(
      String(value).replace(/[\u00A0\u202F]/gu, ' '),
      Math.max(width - 4, 4),
    ) as string[]
  }

  function calculateRowHeight(cells: readonly string[][]): number {
    return Math.max(
      minimumRowHeight,
      ...cells.map((lines) => lines.length * lineHeight + 3),
    )
  }

  function drawHeader(): void {
    document.setFont('helvetica', 'bold')
    document.setFontSize(15)
    document.text(title, margin, y)
    y += 10
    const headerCells = columns.map((column, index) =>
      splitCell(column.header, widths[index]),
    )
    const headerHeight = calculateRowHeight(headerCells)
    document.setFillColor(15, 118, 110)
    document.rect(margin, y - 5, availableWidth, headerHeight, 'F')
    document.setTextColor(255, 255, 255)
    document.setFontSize(9)
    let x = margin
    headerCells.forEach((lines, index) => {
      document.text(lines, x + 2, y)
      x += widths[index]
    })
    document.setTextColor(15, 23, 42)
    document.setFont('helvetica', 'normal')
    y += headerHeight
  }

  drawHeader()
  rows.forEach((row, rowIndex) => {
    const cells = columns.map((column, index) =>
      splitCell(column.pdfValue?.(row) ?? column.value(row), widths[index]),
    )
    const rowHeight = calculateRowHeight(cells)

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
    cells.forEach((lines, columnIndex) => {
      document.text(lines, x + 2, y)
      x += widths[columnIndex]
    })
    y += rowHeight
  })

  document.save(`${fileName}.pdf`)
}
