import { useState } from 'react'
import type { DateRangeParams } from '../utils/dateRange'

interface UseDateRangeFilterOptions {
  onBeforeChange?: () => void
  onChange?: () => void
}

interface DateRangeFilterControls extends DateRangeParams {
  startDate: string
  endDate: string
  setStartDate: (value: string) => void
  setEndDate: (value: string) => void
  clearDateRange: () => void
}

export function useDateRangeFilter({
  onBeforeChange,
  onChange,
}: UseDateRangeFilterOptions = {}): DateRangeFilterControls {
  const [startDate, updateStartDate] = useState<string>('')
  const [endDate, updateEndDate] = useState<string>('')

  function notifyChange(): void {
    onBeforeChange?.()
    onChange?.()
  }

  function setStartDate(value: string): void {
    notifyChange()
    updateStartDate(value)

    if (value && endDate && value > endDate) {
      updateEndDate(value)
    }
  }

  function setEndDate(value: string): void {
    notifyChange()
    updateEndDate(value)

    if (value && startDate && value < startDate) {
      updateStartDate(value)
    }
  }

  function clearDateRange(): void {
    if (!startDate && !endDate) {
      return
    }

    notifyChange()
    updateStartDate('')
    updateEndDate('')
  }

  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    clearDateRange,
  }
}
