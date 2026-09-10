export type DashboardPreset = 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR'
export type DashboardFilter = DashboardPreset | 'CUSTOM'
export type DashboardShortcut =
  | 'YESTERDAY'
  | 'DAY_BEFORE_YESTERDAY'
  | 'LAST_WEEK'
  | 'LAST_MONTH'

export interface DashboardPeriod {
  from: Date
  to: Date
}

const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const MONTH_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
})

export function createPresetPeriod(
  preset: DashboardPreset,
  now: Date = new Date(),
): DashboardPeriod {
  if (preset === 'TODAY') {
    const from = startOfDay(now)
    return { from, to: addDays(from, 1) }
  }

  if (preset === 'WEEK') {
    const from = startOfWeek(now)
    return { from, to: addDays(from, 7) }
  }

  if (preset === 'YEAR') {
    return {
      from: new Date(now.getFullYear(), 0, 1),
      to: new Date(now.getFullYear() + 1, 0, 1),
    }
  }

  return {
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 1),
  }
}

export function createShortcutPeriod(
  shortcut: DashboardShortcut,
  now: Date = new Date(),
): DashboardPeriod {
  if (shortcut === 'YESTERDAY') {
    const from = addDays(startOfDay(now), -1)
    return { from, to: addDays(from, 1) }
  }

  if (shortcut === 'DAY_BEFORE_YESTERDAY') {
    const from = addDays(startOfDay(now), -2)
    return { from, to: addDays(from, 1) }
  }

  if (shortcut === 'LAST_WEEK') {
    const to = startOfWeek(now)
    return { from: addDays(to, -7), to }
  }

  return {
    from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    to: new Date(now.getFullYear(), now.getMonth(), 1),
  }
}

export function formatDateInput(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function parseInclusiveDatePeriod(
  fromValue: string,
  toValue: string,
): DashboardPeriod | null {
  const from = parseInputDate(fromValue)
  const inclusiveTo = parseInputDate(toValue)

  if (!from || !inclusiveTo || from > inclusiveTo) {
    return null
  }

  return { from, to: addDays(inclusiveTo, 1) }
}

export function getInclusivePeriodEnd(period: DashboardPeriod): Date {
  return new Date(period.to.getTime() - 1)
}

export function formatDashboardPeriod(
  period: DashboardPeriod,
  filter: DashboardFilter,
): string {
  const inclusiveTo = getInclusivePeriodEnd(period)

  if (filter === 'TODAY') {
    return `Aujourd’hui, ${DATE_FORMATTER.format(period.from)}`
  }

  if (filter === 'MONTH') {
    return capitalize(MONTH_FORMATTER.format(period.from))
  }

  if (filter === 'YEAR') {
    return String(period.from.getFullYear())
  }

  return `Du ${DATE_FORMATTER.format(period.from)} au ${DATE_FORMATTER.format(inclusiveTo)}`
}

function parseInputDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  const day = Number(match[3])
  const result = new Date(year, monthIndex, day)

  if (
    result.getFullYear() !== year ||
    result.getMonth() !== monthIndex ||
    result.getDate() !== day
  ) {
    return null
  }

  return result
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function startOfWeek(value: Date): Date {
  const result = startOfDay(value)
  const daysSinceMonday = (result.getDay() + 6) % 7

  return addDays(result, -daysSinceMonday)
}

function addDays(value: Date, amount: number): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate() + amount)
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
}
