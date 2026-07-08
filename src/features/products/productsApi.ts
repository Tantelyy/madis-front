import { requestEmpty, requestJson } from '../../utils/apiClient'

export interface ProductUser {
  id: number
  userName: string
  email: string
}

export interface ProductMark {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface ProductSpecification {
  id: number
  specification: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface ProductFormat {
  id: number
  format: string
  createdAt: string
  updatedAt: string
}

export interface ProductType {
  id: number
  type: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: number
  name: string
  reference: string
  markId: number
  specificationId: number
  formatId: number
  productTypeId: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  deletedBy: number | null
  createdBy: number
  image: string | null
  updatedBy: number | null
  mark?: ProductMark
  specification?: ProductSpecification
  format?: ProductFormat
  productType?: ProductType
  createdByUser?: ProductUser
  updatedByUser?: ProductUser | null
  deletedByUser?: ProductUser | null
}

export interface ProductPayload {
  reference: string
  markId: number
  specificationId: number
  formatId: number
  productTypeId: number
  image?: string
}

export interface ListProductsParams {
  page: number
  limit: number
  search?: string
  sortBy?: 'name' | 'reference' | 'createdAt' | 'updatedAt' | 'deletedAt'
  order?: 'asc' | 'desc'
}

export interface PaginatedProducts {
  data: Product[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type ReferentialKind = 'types' | 'marks' | 'formats' | 'specifications'

export interface ReferentialConfig<TItem> {
  kind: ReferentialKind
  label: string
  field: keyof TItem & string
  placeholder: string
}

export function listProducts(
  params: ListProductsParams,
): Promise<PaginatedProducts> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    sortBy: params.sortBy ?? 'createdAt',
    order: params.order ?? 'desc',
  })

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim())
  }

  return requestJson<PaginatedProducts>(`/products?${searchParams}`)
}

export function createProduct(payload: ProductPayload): Promise<Product> {
  return requestJson<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateProduct(
  id: number,
  payload: ProductPayload,
): Promise<Product> {
  return requestJson<Product>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteProduct(id: number): Promise<void> {
  return requestEmpty(`/products/${id}`, {
    method: 'DELETE',
  })
}

export function listProductMarks(): Promise<ProductMark[]> {
  return requestJson<ProductMark[]>('/products/marks')
}

export function createProductMark(name: string): Promise<ProductMark> {
  return requestJson<ProductMark>('/products/marks', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export function updateProductMark(
  id: number,
  name: string,
): Promise<ProductMark> {
  return requestJson<ProductMark>(`/products/marks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  })
}

export function deleteProductMark(id: number): Promise<void> {
  return requestEmpty(`/products/marks/${id}`, { method: 'DELETE' })
}

export function listProductSpecifications(): Promise<ProductSpecification[]> {
  return requestJson<ProductSpecification[]>('/products/specifications')
}

export function createProductSpecification(
  specification: string,
): Promise<ProductSpecification> {
  return requestJson<ProductSpecification>('/products/specifications', {
    method: 'POST',
    body: JSON.stringify({ specification }),
  })
}

export function updateProductSpecification(
  id: number,
  specification: string,
): Promise<ProductSpecification> {
  return requestJson<ProductSpecification>(`/products/specifications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ specification }),
  })
}

export function deleteProductSpecification(id: number): Promise<void> {
  return requestEmpty(`/products/specifications/${id}`, { method: 'DELETE' })
}

export function listProductFormats(): Promise<ProductFormat[]> {
  return requestJson<ProductFormat[]>('/products/formats')
}

export function createProductFormat(format: string): Promise<ProductFormat> {
  return requestJson<ProductFormat>('/products/formats', {
    method: 'POST',
    body: JSON.stringify({ format }),
  })
}

export function updateProductFormat(
  id: number,
  format: string,
): Promise<ProductFormat> {
  return requestJson<ProductFormat>(`/products/formats/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ format }),
  })
}

export function deleteProductFormat(id: number): Promise<void> {
  return requestEmpty(`/products/formats/${id}`, { method: 'DELETE' })
}

export function listProductTypes(): Promise<ProductType[]> {
  return requestJson<ProductType[]>('/products/types')
}

export function createProductType(type: string): Promise<ProductType> {
  return requestJson<ProductType>('/products/types', {
    method: 'POST',
    body: JSON.stringify({ type }),
  })
}

export function updateProductType(
  id: number,
  type: string,
): Promise<ProductType> {
  return requestJson<ProductType>(`/products/types/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ type }),
  })
}

export function deleteProductType(id: number): Promise<void> {
  return requestEmpty(`/products/types/${id}`, { method: 'DELETE' })
}
