interface PaginatedResponse<TItem> {
  data: TItem[]
  meta: {
    totalPages: number
  }
}

export async function listAllPages<TItem>(
  fetchPage: (page: number) => Promise<PaginatedResponse<TItem>>,
): Promise<TItem[]> {
  const firstPage = await fetchPage(1)

  if (firstPage.meta.totalPages <= 1) {
    return firstPage.data
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.meta.totalPages - 1 }, (_, index) =>
      fetchPage(index + 2),
    ),
  )

  return [
    ...firstPage.data,
    ...remainingPages.flatMap((response) => response.data),
  ]
}
