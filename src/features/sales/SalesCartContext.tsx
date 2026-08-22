import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  SalesCartContext,
  type SalesCartContextValue,
  type SalesCartItem,
} from './salesCart'
import { normalizeWholesaleRequest } from './salesRules'

export function SalesCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SalesCartItem[]>([])
  const [catalogRevision, setCatalogRevision] = useState<number>(0)
  const notifyCatalogChanged = useCallback((): void => {
    setCatalogRevision((currentRevision) => currentRevision + 1)
  }, [])

  const value = useMemo<SalesCartContextValue>(
    () => ({
      items,
      itemCount: items.length,
      catalogRevision,
      addItem: (item) => {
        setItems((currentItems) => {
          const normalizedItem = {
            ...item,
            wholesale: normalizeWholesaleRequest(
              item.quantity,
              item.wholesale,
            ),
          }
          const existingItem = currentItems.find(
            ({ product }) => product.id === item.product.id,
          )

          if (!existingItem) {
            return [...currentItems, normalizedItem]
          }

          return currentItems.map((currentItem) =>
            currentItem.product.id === item.product.id
              ? normalizedItem
              : currentItem,
          )
        })
      },
      updateItem: (productId, quantity, wholesale) => {
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.product.id === productId
              ? {
                  ...item,
                  quantity,
                  wholesale: normalizeWholesaleRequest(quantity, wholesale),
                }
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
      notifyCatalogChanged,
    }),
    [catalogRevision, items, notifyCatalogChanged],
  )

  return (
    <SalesCartContext.Provider value={value}>
      {children}
    </SalesCartContext.Provider>
  )
}
