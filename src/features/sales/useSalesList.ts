import { useCallback, useEffect, useState } from 'react'
import { createPaginationMeta } from '../../utils/paginationMeta'
import type { DateRangeParams } from '../../utils/dateRange'
import {
  listSales,
  type CartStatus,
  type PaginatedSales,
  type Sale,
} from './salesApi'

export function useSalesList(
  status: CartStatus | undefined,
  pageSize: number,
  approvalQueue = false,
  dateRange: DateRangeParams = {},
) {
  const { startDate, endDate } = dateRange
  const [sales, setSales] = useState<Sale[]>([])
  const [meta, setMeta] = useState<PaginatedSales['meta']>(() =>
    createPaginationMeta(pageSize),
  )
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const fetchSales = useCallback(
    () =>
      listSales({
        page,
        limit: pageSize,
        search,
        status,
        approvalQueue,
        startDate,
        endDate,
      }),
    [
      approvalQueue,
      endDate,
      page,
      pageSize,
      search,
      startDate,
      status,
    ],
  )

  const applySales = useCallback((response: PaginatedSales): void => {
    setSales(response.data)
    setMeta(response.meta)
  }, [])

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      applySales(await fetchSales())
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible de charger les ventes.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [applySales, fetchSales])

  useEffect(() => {
    let isActive = true

    void fetchSales()
      .then((response) => {
        if (isActive) {
          applySales(response)
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Impossible de charger les ventes.',
          )
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [applySales, fetchSales])

  return {
    sales,
    meta,
    page,
    search,
    isLoading,
    errorMessage,
    setPage,
    setSearch,
    setIsLoading,
    setErrorMessage,
    refresh,
  }
}
