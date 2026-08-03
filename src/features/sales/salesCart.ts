import { createContext, useContext } from 'react'
import type { SaleCatalogProduct } from './salesApi'

export interface SalesCartItem {
  product: SaleCatalogProduct
  quantity: number
  wholesale: boolean
}

export interface SalesCartContextValue {
  items: SalesCartItem[]
  itemCount: number
  addItem: (item: SalesCartItem) => void
  updateItem: (productId: number, quantity: number, wholesale: boolean) => void
  removeItem: (productId: number) => void
  clearCart: () => void
}

export const SalesCartContext = createContext<SalesCartContextValue | null>(null)

export function useSalesCart(): SalesCartContextValue {
  const context = useContext(SalesCartContext)

  if (!context) {
    throw new Error('useSalesCart doit être utilisé dans SalesCartProvider.')
  }

  return context
}
