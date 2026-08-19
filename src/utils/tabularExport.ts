import { downloadBlob } from './fileDownload'
import { MADIS_BRANDING } from '../config/branding'

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

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Le logo ne peut pas être lu.'))
      }
    })
    reader.addEventListener('error', () =>
      reject(new Error('Le logo ne peut pas être lu.')),
    )
    reader.readAsDataURL(blob)
  })
}

let brandLogoPromise: Promise<string | null> | null = null

function loadBrandLogo(): Promise<string | null> {
  brandLogoPromise ??= (async () => {
    try {
      const response = await fetch(MADIS_BRANDING.logoPath)

      if (!response.ok) {
        return null
      }

      return await readBlobAsDataUrl(await response.blob())
    } catch {
      return null
    }
  })()

  return brandLogoPromise
}

function formatExportDate(value: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Indian/Antananarivo',
  }).format(value)
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
  const logo = await loadBrandLogo()
  const exportedAt = formatExportDate(new Date())
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
  let y = 12

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
    if (logo) {
      document.addImage(logo, margin, y, 14, 14)
    } else {
      document.setFillColor(15, 118, 110)
      document.roundedRect(margin, y, 14, 14, 2, 2, 'F')
      document.setTextColor(255, 255, 255)
      document.setFont('helvetica', 'bold')
      document.setFontSize(10)
      document.text('M', margin + 7, y + 9.5, { align: 'center' })
    }

    y += 24
    document.setFont('helvetica', 'bold')
    document.setFontSize(15)
    document.text(title, margin, y)
    document.setFont('helvetica', 'normal')
    document.setFontSize(9)
    document.setTextColor(71, 85, 105)
    document.text(`Exporté le ${exportedAt}`, pageWidth - margin, y, {
      align: 'right',
    })
    document.setTextColor(15, 23, 42)
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
      y = 12
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
