import { useState, type FormEvent } from 'react'
import { InventoryModal } from '../inventories/InventoryModal'
import { formatDate, formatPrice } from '../../utils/displayFormatters'
import { formatPromotionBadge } from './promotionFormatters'
import { useSalesCart } from './salesCart'
import type { SaleCatalogProduct } from './salesApi'

export function SaleProductCard({ product }: { product: SaleCatalogProduct }) {
  const { addItem } = useSalesCart()
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false)
  const [quantity, setQuantity] = useState<number>(1)
  const [wholesale, setWholesale] = useState<boolean>(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    addItem({ product, quantity: Math.max(1, quantity), wholesale })
    setIsAddModalOpen(false)
    setQuantity(1)
    setWholesale(false)
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-slate-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-5xl font-bold text-teal-700">
            {product.name.slice(0, 1).toUpperCase()}
          </span>
        )}

        {product.promotion ? (
          <div className="group absolute left-3 top-3">
            <span
              tabIndex={0}
              className="block cursor-help rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950 shadow-sm outline-none focus:ring-4 focus:ring-amber-200"
            >
              {formatPromotionBadge(product.promotion)}
            </span>
            <div className="pointer-events-none absolute left-0 top-full z-10 mt-2 w-max max-w-64 translate-y-1 rounded-lg bg-slate-950 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-xl transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
              Valide jusqu’au {formatDate(product.promotionEndDate)}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <h2 className="line-clamp-2 text-lg font-bold text-slate-950">
          {product.name}
        </h2>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-teal-50 p-3">
            <p className="text-xs text-slate-500">Détail</p>
            <p className="font-bold text-teal-800">
              {formatPrice(product.retailPrice)}
            </p>
          </div>
          <div className="rounded-lg bg-slate-100 p-3">
            <p className="text-xs text-slate-500">Gros</p>
            <p className="font-bold text-slate-800">
              {formatPrice(product.wholesalePrice)}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          Stock total : <strong>{product.totalStock}</strong>
          {product.promotion ? (
            <span className="ml-1 text-amber-700">
              · {product.promotionStock} en promotion
            </span>
          ) : null}
        </p>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="mt-auto w-full rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Ajouter au panier
        </button>
      </div>

      {isAddModalOpen ? (
        <InventoryModal
          title={`Ajouter ${product.name}`}
          onClose={() => setIsAddModalOpen(false)}
          size="sm"
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-slate-700">
              Quantité souhaitée
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) =>
                  setQuantity(Math.max(1, Number(event.target.value)))
                }
                autoFocus
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              />
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={wholesale}
                onChange={(event) => setWholesale(event.target.checked)}
                className="h-4 w-4 accent-teal-700"
              />
              Demander le prix de gros
            </label>
            <p className="text-xs text-slate-500">
              Le prix de gros est appliqué automatiquement au-delà de 3 unités.
            </p>
            <button
              type="submit"
              className="w-full rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800"
            >
              Confirmer l’ajout
            </button>
          </form>
        </InventoryModal>
      ) : null}
    </article>
  )
}
