import { useState, type FormEvent } from 'react'
import { InventoryModal } from '../inventories/InventoryModal'
import { ProductImage } from '../../components/ProductImage'
import { formatDate, formatPrice } from '../../utils/displayFormatters'
import { formatPromotionBadge } from './promotionFormatters'
import { useSalesCart } from './salesCart'
import type { SaleCatalogProduct } from './salesApi'
import {
  AUTOMATIC_WHOLESALE_MIN_QUANTITY,
  parseSaleQuantity,
  usesAutomaticWholesalePrice,
} from './salesRules'

export function SaleProductCard({ product }: { product: SaleCatalogProduct }) {
  const { addItem } = useSalesCart()
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false)
  const [quantityInput, setQuantityInput] = useState<string>('1')
  const [wholesale, setWholesale] = useState<boolean>(false)
  const quantity = parseSaleQuantity(quantityInput)
  const usesAutomaticWholesale =
    quantity !== null && usesAutomaticWholesalePrice(quantity)
  const hasReduction = product.promotion?.type === 'REDUCTION'
  const isOutOfStock = product.totalStock <= 0

  function closeAddModal(): void {
    setIsAddModalOpen(false)
    setQuantityInput('1')
    setWholesale(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    if (quantity === null) {
      return
    }

    addItem({ product, quantity, wholesale })
    closeAddModal()
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <ProductImage image={product.image} name={product.name}>
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
      </ProductImage>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <h2 className="line-clamp-2 text-lg font-bold text-slate-950">
          {product.name}
        </h2>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <SalePriceCard
            label="Détail"
            normalPrice={product.baseRetailPrice}
            currentPrice={product.retailPrice}
            hasReduction={hasReduction}
            variant="retail"
          />
          <SalePriceCard
            label="Gros"
            normalPrice={product.baseWholesalePrice}
            currentPrice={product.wholesalePrice}
            hasReduction={hasReduction}
            variant="wholesale"
          />
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
          disabled={isOutOfStock}
          onClick={() => setIsAddModalOpen(true)}
          className="mt-auto w-full rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
        >
          {isOutOfStock ? 'Stock épuisé' : 'Ajouter au panier'}
        </button>
      </div>

      {isAddModalOpen ? (
        <InventoryModal
          title={`Ajouter ${product.name}`}
          onClose={closeAddModal}
          size="sm"
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-slate-700">
              Quantité souhaitée
              <input
                type="number"
                min="1"
                step="1"
                required
                value={quantityInput}
                onChange={(event) => {
                  const nextValue = event.target.value
                  setQuantityInput(nextValue)

                  const nextQuantity = parseSaleQuantity(nextValue)
                  if (
                    nextQuantity !== null &&
                    usesAutomaticWholesalePrice(nextQuantity)
                  ) {
                    setWholesale(false)
                  }
                }}
                autoFocus
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              />
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={wholesale && !usesAutomaticWholesale}
                disabled={usesAutomaticWholesale}
                onChange={(event) => setWholesale(event.target.checked)}
                className="h-4 w-4 accent-teal-700 disabled:cursor-not-allowed"
              />
              Demander le prix de gros
            </label>
            <p className="text-xs text-slate-500">
              Le prix de gros est appliqué automatiquement à partir de{' '}
              {AUTOMATIC_WHOLESALE_MIN_QUANTITY} unités.
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

interface SalePriceCardProps {
  label: string
  normalPrice: string | null
  currentPrice: string | null
  hasReduction: boolean
  variant: 'retail' | 'wholesale'
}

const PRICE_CARD_STYLES: Readonly<
  Record<SalePriceCardProps['variant'], string>
> = {
  retail: 'bg-teal-50 text-teal-800',
  wholesale: 'bg-slate-100 text-slate-800',
}

function SalePriceCard({
  label,
  normalPrice,
  currentPrice,
  hasReduction,
  variant,
}: SalePriceCardProps) {
  return (
    <div className={`rounded-lg p-3 ${PRICE_CARD_STYLES[variant]}`}>
      <p className="text-xs text-slate-500">{label}</p>
      {hasReduction ? (
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <span className="text-xs text-slate-500 line-through">
            {formatPrice(normalPrice)}
          </span>
          <span className="font-bold">{formatPrice(currentPrice)}</span>
        </div>
      ) : (
        <p className="font-bold">{formatPrice(currentPrice)}</p>
      )}
    </div>
  )
}
