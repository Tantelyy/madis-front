export interface DateRangeParams {
  startDate?: string
  endDate?: string
}

export function appendDateRangeSearchParams(
  searchParams: URLSearchParams,
  { startDate, endDate }: DateRangeParams,
): void {
  if (startDate) {
    searchParams.set('startDate', startDate)
  }

  if (endDate) {
    searchParams.set('endDate', endDate)
  }
}
