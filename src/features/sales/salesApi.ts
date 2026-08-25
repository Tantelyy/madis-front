import { requestBlob, requestJson } from '../../utils/apiClient'
import { downloadBlob } from '../../utils/fileDownload'
import { listAllPages } from '../../utils/paginatedFetch'
import {
  appendDateRangeSearchParams,
  type DateRangeParams,
} from '../../utils/dateRange'
import type { PaymentMethod } from './paymentMethods'

export type { PaymentMethod } from './paymentMethods'

export type CartStatus =
  | 'PENDING'
  | 'VALIDATED'
  | 'PAID'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'CANCELLED'
export interface SaleCatalogProduct {
  id: number
  name: string
  reference: string
  image: string | null
  retailPrice: string | null
  wholesalePrice: string | null
  baseRetailPrice: string | null
  baseWholesalePrice: string | null
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
  productIdOffer: number | null
  productOfferName: string | null
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
  refundAt: string | null
  refundBy: number | null
  refundedQuantity: number
  reason: string | null
  refundUser?: {
    id: number
    userName: string
    email: string
  } | null
  product: {
    id: number
    name: string
    reference: string
    image: string | null
  }
}

export interface Sale {
  id: number
  soldBy: number
  createdAt: string
  updatedAt: string
  status: CartStatus
  validatedBy: number | null
  validatedAt: string | null
  paidAt: string | null
  totalPrice: string
  customerName: string | null
  customerContact: string | null
  customerAddress: string | null
  customerNif: string | null
  customerStat: string | null
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

export interface RefundSaleItemPayload {
  cartDetailId: number
  quantity: number
  reason: string
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
  customerName?: string
  customerContact?: string
  customerAddress?: string
  customerNif?: string
  customerStat?: string
  paymentMethod?: PaymentMethod
  items: {
    productId: number
    quantity: number
    wholesale: boolean
  }[]
}

export interface SaleImportSummary {
  rowsProcessed: number
  rowsNotSold: number
  rowsWithoutInventory: number
  salesCreated: number
  movementsCreated: number
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
  return listAllPages((page) => listSaleCatalog({ page, limit: 100 }))
}

export function createSale(payload: CreateSalePayload): Promise<Sale> {
  return requestJson<Sale>('/sales', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function importSalesCsv(file: File): Promise<SaleImportSummary> {
  const formData = new FormData()
  formData.append('file', file)

  return requestJson<SaleImportSummary>('/sales/import', {
    method: 'POST',
    body: formData,
  })
}

export interface ListSalesParams extends DateRangeParams {
  page: number
  limit: number
  search?: string
  status?: CartStatus
  approvalQueue?: boolean
}

export function listSales(params: ListSalesParams): Promise<PaginatedSales> {
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

  if (params.approvalQueue) {
    searchParams.set('approvalQueue', 'true')
  }

  appendDateRangeSearchParams(searchParams, params)

  return requestJson<PaginatedSales>(`/sales?${searchParams}`)
}

export function listAllSales(
  params: Omit<ListSalesParams, 'page' | 'limit'>,
): Promise<Sale[]> {
  return listAllPages((page) => listSales({ ...params, page, limit: 100 }))
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
  return requestJson<Sale>(`/sales/${id}/validate`, {
    method: 'POST',
  })
}

function reverseSale(
  id: number,
  action: 'refund' | 'cancel',
  reason: string,
): Promise<Sale> {
  return requestJson<Sale>(`/sales/${id}/${action}`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

export function refundSale(
  id: number,
  items: readonly RefundSaleItemPayload[],
): Promise<Sale> {
  return requestJson<Sale>(`/sales/${id}/refund`, {
    method: 'POST',
    body: JSON.stringify({ items }),
  })
}

export function cancelSale(id: number, reason: string): Promise<Sale> {
  return reverseSale(id, 'cancel', reason)
}

export interface InvoiceCustomer {
  customerName?: string
  customerContact?: string
  customerAddress?: string
  customerNif?: string
  customerStat?: string
}

export async function downloadSaleInvoice(
  id: number,
  customer: InvoiceCustomer = {},
): Promise<void> {
  const invoice = await requestBlob(`/sales/${id}/invoice`, {
    method: 'POST',
    body: JSON.stringify(customer),
  })

  downloadBlob(invoice, `facture-${id}.pdf`)
}
