type SortOrder = 'asc' | 'desc'

interface SortLabelOptions {
  inactiveIndicator?: string
  ascIndicator?: string
  descIndicator?: string
}

export function getSortLabel<TSortField extends string>(
  currentSortBy: TSortField,
  currentSortOrder: SortOrder,
  field: TSortField,
  label: string,
  options: SortLabelOptions = {},
): string {
  const {
    inactiveIndicator = '-',
    ascIndicator = 'ASC',
    descIndicator = 'DESC',
  } = options

  if (currentSortBy !== field) {
    return `${label} ${inactiveIndicator}`
  }

  return `${label} ${currentSortOrder === 'asc' ? ascIndicator : descIndicator}`
}
