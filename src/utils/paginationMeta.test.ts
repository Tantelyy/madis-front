import { describe, expect, it } from 'vitest'
import { createPaginationMeta, normalizePaginationMeta } from './paginationMeta'

describe('pagination metadata', () => {
  it('creates a stable empty first page', () => {
    expect(createPaginationMeta(25)).toEqual({
      total: 0,
      page: 1,
      limit: 25,
      totalPages: 1,
    })
  })

  it('never exposes zero pages to the UI', () => {
    expect(
      normalizePaginationMeta({ total: 0, page: 1, limit: 10, totalPages: 0 }),
    ).toEqual({ total: 0, page: 1, limit: 10, totalPages: 1 })
  })
})

