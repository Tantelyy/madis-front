import { useMemo, useState, type ReactNode } from 'react'
import {
  SalesCartContext,
  type SalesCartContextValue,
  type SalesCartItem,
} from './salesCart'

export function SalesCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SalesCartItem[]>([])

  const value = useMemo<SalesCartContextValue>(
    () => ({
      items,
      itemCount: items.length,
      addItem: (item) => {
        setItems((currentItems) => {
          const existingItem = currentItems.find(
            ({ product }) => product.id === item.product.id,
          )

          if (!existingItem) {
            return [...currentItems, item]
          }

          return currentItems.map((currentItem) =>
            currentItem.product.id === item.product.id ? item : currentItem,
          )
        })
      },
      updateItem: (productId, quantity, wholesale) => {
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.product.id === productId
              ? { ...item, quantity, wholesale }
              : item,
          ),
        )
      },
      removeItem: (productId) => {
        setItems((currentItems) =>
          currentItems.filter(({ product }) => product.id !== productId),
        )
      },
      clearCart: () => setItems([]),
    }),
    [items],
  )

  return (
    <SalesCartContext.Provider value={value}>
      {children}
    </SalesCartContext.Provider>
  )
}
