import { requestEmpty, requestJson } from '../../utils/apiClient'

export type SpecialOfferType = 'REDUCTION' | 'BUY_X_GET_N'
export type SpecialOfferUnit = 'PERCENT' | 'FIXED'

export interface SpecialOffer {
  id: number
  label: string
  createdAt: string
  createdBy: number
  updatedAt: string
  deletedAt: string | null
  deletedBy: number | null
  startDateTime: string
  endDateTime: string
  value: string | null
  unit: SpecialOfferUnit | null
  buyQuantity: number | null
  freeQuantity: number | null
  type: SpecialOfferType
  productIds: number[]
  limitDate: string | null
  hasSales: boolean
}

export interface SpecialOfferPayload {
  productIds: number[]
  label: string
  startDateTime: string
  endDateTime: string
  limitDate?: string
  type: SpecialOfferType
  value?: number
  unit?: SpecialOfferUnit
  buyQuantity?: number
  freeQuantity?: number
}

export interface PaginatedSpecialOffers {
  data: SpecialOffer[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function listSpecialOffers(params: {
  page: number
  limit: number
  search?: string
  validAt?: string
}): Promise<PaginatedSpecialOffers> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  })

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim())
  }

  if (params.validAt) {
    searchParams.set('validAt', params.validAt)
  }

  return requestJson<PaginatedSpecialOffers>(
    `/special-offers?${searchParams}`,
  )
}

export function createSpecialOffer(
  payload: SpecialOfferPayload,
): Promise<SpecialOffer> {
  return requestJson<SpecialOffer>('/special-offers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateSpecialOffer(
  id: number,
  payload: SpecialOfferPayload,
): Promise<SpecialOffer> {
  return requestJson<SpecialOffer>(`/special-offers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteSpecialOffer(id: number): Promise<void> {
  return requestEmpty(`/special-offers/${id}`, { method: 'DELETE' })
}
