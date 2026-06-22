import { useEffect, useRef, useState } from 'react'
import type { Product } from './productsApi'

interface ProductCardProps {
  product: Product
  onDetails: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductCard({
  product,
  onDetails,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    function handlePointerDown(event: PointerEvent): void {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (!menuRef.current?.contains(target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isMenuOpen])

  function handleAction(action: (product: Product) => void): void {
    setIsMenuOpen(false)
    action(product)
  }

  return (
    <article className="flex h-full min-h-[20rem] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-slate-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-4xl font-bold text-teal-700">
            {product.name.slice(0, 1).toUpperCase()}
          </span>
        )}

        <div ref={menuRef} className="absolute right-3 top-3">
          <button
            type="button"
            onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm transition hover:bg-white hover:text-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-100"
            aria-label="Actions du produit"
            title="Actions du produit"
          >
            <span
              className="flex items-center justify-center gap-0.5"
              aria-hidden="true"
            >
              <span className="h-1 w-1 rounded-full bg-current" />
              <span className="h-1 w-1 rounded-full bg-current" />
              <span className="h-1 w-1 rounded-full bg-current" />
            </span>
          </button>

          {isMenuOpen ? (
            <div className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={() => handleAction(onDetails)}
                className="block w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-teal-50 hover:text-teal-700"
              >
                Détails
              </button>
              <button
                type="button"
                onClick={() => handleAction(onEdit)}
                className="block w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-teal-50 hover:text-teal-700"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => handleAction(onDelete)}
                className="block w-full px-4 py-2 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50"
              >
                Supprimer
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-end gap-2 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
          {product.reference}
        </p>
        <h2 className="line-clamp-2 text-base font-bold text-slate-950">
          {product.name}
        </h2>
      </div>
    </article>
  )
}
