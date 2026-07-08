import { useState, type ChangeEvent } from 'react'

type SortOrder = 'asc' | 'desc'

interface UseListControlsOptions<TSortField extends string> {
  initialSortBy: TSortField
  initialOrder?: SortOrder
  onBeforeChange?: () => void
}

export function useListControls<TSortField extends string>({
  initialSortBy,
  initialOrder = 'desc',
  onBeforeChange,
}: UseListControlsOptions<TSortField>) {
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState<string>('')
  const [sortBy, setSortBy] = useState<TSortField>(initialSortBy)
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialOrder)

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>): void {
    onBeforeChange?.()
    setSearch(event.target.value)
    setPage(1)
  }

  function handlePageChange(nextPage: number): void {
    onBeforeChange?.()
    setPage(nextPage)
  }

  function handleSort(nextSortBy: TSortField): void {
    onBeforeChange?.()
    setPage(1)
    setSortOrder((currentSortOrder) =>
      sortBy === nextSortBy && currentSortOrder === 'desc' ? 'asc' : 'desc',
    )
    setSortBy(nextSortBy)
  }

  return {
    page,
    setPage,
    search,
    sortBy,
    sortOrder,
    handleSearchChange,
    handlePageChange,
    handleSort,
  }
}
