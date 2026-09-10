import { describe, expect, it } from 'vitest'
import { getSortLabel } from './sortLabel'

describe('getSortLabel', () => {
  it('shows the inactive indicator for another field', () => {
    expect(getSortLabel('name', 'asc', 'price', 'Prix')).toBe('Prix -')
  })

  it('shows the configured direction for the active field', () => {
    expect(getSortLabel('price', 'desc', 'price', 'Prix')).toBe('Prix DESC')
  })
})

