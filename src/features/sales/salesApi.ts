import { requestJson } from '../../utils/apiClient'

export type CartStatus =
  | 'PENDING'
  | 'VALIDATED'
  | 'PAID'
  | 'REFUNDED'
  | 'CANCELLED'
export type PaymentMethod =
  | 'MVOLA'
  | 'AIRTEL_MONEY'
  | 'ORANGE_MONEY'
  | 'CASH'

export const PAYMENT_METHOD_OPTIONS: readonly {
  value: PaymentMethod
  label: string
}[] = [
  { value: 'CASH', label: 'Espèces' },
  { value: 'MVOLA', label: 'MVola' },
  { value: 'AIRTEL_MONEY', label: 'Airtel Money' },
  { value: 'ORANGE_MONEY', label: 'Orange Money' },
]

export interface SaleCatalogProduct {
  id: number
  name: string
  reference: string
  image: string | null
  retailPrice: string | null
  wholesalePrice: string | null
  totalStock: number
  promotionStock: number
  hasPromotion: boolean
  promotionEndDate: string | null
  promotion: SaleCatalogPromotion | null
}

export interface SaleCatalogPromotion {
  id: number
  type: 'REDUCTION' | 'BUY_X_GET_N'
  value: string | null
  unit: 'PERCENT' | 'FIXED' | null
  buyQuantity: number | null
  freeQuantity: number | null
}

export interface SaleDetail {
  id: number
  inventoryId: number
  quantity: number
  freeQuantity: number | null
  baseUnitPrice: string
  finalUnitPrice: string
  discountAmount: string | null
  wholesale: boolean
  specialOfferId: number | null
}

export interface Sale {
  id: number
  soldBy: number
  createdAt: string
  updatedAt: string
  status: CartStatus
  validatedBy: number | null
  totalPrice: string
  customerName: string
  customerContact: string
  customerAddress: string
  paymentMethod: PaymentMethod | null
  reason: string | null
  cartDetails: SaleDetail[]
  seller?: {
    id: number
    userName: string
    email: string
  }
  validator?: {
    id: number
    userName: string
    email: string
  } | null
}

export interface PaginatedSaleCatalog {
  data: SaleCatalogProduct[]
  meta: PaginationMeta
}

export interface PaginatedSales {
  data: Sale[]
  meta: PaginationMeta
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateSalePayload {
  customerName: string
  customerContact: string
  customerAddress: string
  items: {
    productId: number
    quantity: number
    wholesale: boolean
  }[]
}

export function listSaleCatalog(params: {
  page: number
  limit: number
  search?: string
}): Promise<PaginatedSaleCatalog> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  })

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim())
  }

  return requestJson<PaginatedSaleCatalog>(`/sales/catalog?${searchParams}`)
}

export async function listAllSaleCatalogProducts(): Promise<
  SaleCatalogProduct[]
> {
  const firstPage = await listSaleCatalog({ page: 1, limit: 100 })

  if (firstPage.meta.totalPages <= 1) {
    return firstPage.data
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.meta.totalPages - 1 }, (_, index) =>
      listSaleCatalog({ page: index + 2, limit: 100 }),
    ),
  )

  return [
    ...firstPage.data,
    ...remainingPages.flatMap((response) => response.data),
  ]
}

export function createSale(payload: CreateSalePayload): Promise<Sale> {
  return requestJson<Sale>('/sales', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function listSales(params: {
  page: number
  limit: number
  search?: string
  status?: CartStatus
}): Promise<PaginatedSales> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  })

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim())
  }

  if (params.status) {
    searchParams.set('status', params.status)
  }

  return requestJson<PaginatedSales>(`/sales?${searchParams}`)
}

export function paySale(
  id: number,
  paymentMethod: PaymentMethod,
): Promise<Sale> {
  return requestJson<Sale>(`/sales/${id}/pay`, {
    method: 'POST',
    body: JSON.stringify({ paymentMethod }),
  })
}

export function validateSale(id: number): Promise<Sale> {
  return requestJson<Sale>(`/sales/${id}/validate`, { method: 'POST' })
}
