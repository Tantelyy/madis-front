export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export function createPaginationMeta(limit: number): PaginationMeta {
  return {
    total: 0,
    page: 1,
    limit,
    totalPages: 1,
  }
}

export function normalizePaginationMeta<TMeta extends PaginationMeta>(
  meta: TMeta,
): TMeta {
  return {
    ...meta,
    totalPages: Math.max(meta.totalPages, 1),
  }
}
