import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react'
import type { SaleCatalogProduct } from '../sales/salesApi'
import type {
  SpecialOffer,
  SpecialOfferPayload,
  SpecialOfferType,
  SpecialOfferUnit,
} from './promotionsApi'

interface SpecialOfferFormProps {
  offer?: SpecialOffer
  products: SaleCatalogProduct[]
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (payload: SpecialOfferPayload) => Promise<void>
}

interface FormValues {
  label: string
  startDateTime: string
  endDateTime: string
  limitDate: string
  type: SpecialOfferType
  value: string
  unit: SpecialOfferUnit
  buyQuantity: string
  freeQuantity: string
}

function toDateTimeInput(value: string | undefined): string {
  return value ? value.slice(0, 16) : ''
}

function initialValues(offer?: SpecialOffer): FormValues {
  return {
    label: offer?.label ?? '',
    startDateTime: toDateTimeInput(offer?.startDateTime),
    endDateTime: toDateTimeInput(offer?.endDateTime),
    limitDate: offer?.limitDate?.slice(0, 10) ?? '',
    type: offer?.type ?? 'REDUCTION',
    value: offer?.value ? String(Number(offer.value)) : '',
    unit: offer?.unit ?? 'PERCENT',
    buyQuantity: offer?.buyQuantity ? String(offer.buyQuantity) : '',
    freeQuantity: offer?.freeQuantity ? String(offer.freeQuantity) : '',
  }
}

export function SpecialOfferForm({
  offer,
  products,
  isSubmitting,
  onCancel,
  onSubmit,
}: SpecialOfferFormProps) {
  const [values, setValues] = useState<FormValues>(() => initialValues(offer))
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>(
    () => offer?.productIds ?? [],
  )
  const [productSearch, setProductSearch] = useState<string>('')

  const normalizedProductSearch = productSearch.trim().toLocaleLowerCase()
  const filteredProducts = products.filter(
    (product) =>
      normalizedProductSearch.length === 0 ||
      product.name.toLocaleLowerCase().includes(normalizedProductSearch) ||
      product.reference.toLocaleLowerCase().includes(normalizedProductSearch),
  )

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void {
    const name = event.target.name as keyof FormValues
    setValues((currentValues) => ({
      ...currentValues,
      [name]: event.target.value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    if (selectedProductIds.length === 0) {
      return
    }

    const payload: SpecialOfferPayload = {
      productIds: selectedProductIds,
      label: values.label,
      startDateTime: new Date(values.startDateTime).toISOString(),
      endDateTime: new Date(values.endDateTime).toISOString(),
      limitDate: values.limitDate
        ? new Date(`${values.limitDate}T23:59:59.999Z`).toISOString()
        : undefined,
      type: values.type,
    }

    if (values.type === 'REDUCTION') {
      payload.value = Number(values.value)
      payload.unit = values.unit
    } else {
      payload.buyQuantity = Number(values.buyQuantity)
      payload.freeQuantity = Number(values.freeQuantity)
    }

    await onSubmit(payload)
  }

  function toggleProduct(productId: number): void {
    setSelectedProductIds((currentProductIds) =>
      currentProductIds.includes(productId)
        ? currentProductIds.filter((id) => id !== productId)
        : [...currentProductIds, productId],
    )
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Field label="Produits concernés">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-100">
          <div className="border-b border-slate-200 p-3">
            <input
              type="search"
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              placeholder="Rechercher un produit par nom ou référence"
              aria-label="Rechercher un produit à mettre en promotion"
              className="w-full border-0 px-1 py-1 outline-none"
            />
          </div>
          <div className="max-h-52 overflow-y-auto p-2">
            {filteredProducts.length === 0 ? (
              <p className="px-3 py-5 text-center text-sm text-slate-500">
                Aucun produit trouvé.
              </p>
            ) : (
              filteredProducts.map((product) => (
                <label
                  key={product.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-teal-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                    className="h-4 w-4 accent-teal-700"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-slate-800">
                      {product.name}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {product.reference}
                    </span>
                  </span>
                </label>
              ))
            )}
          </div>
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
            {selectedProductIds.length} produit(s) sélectionné(s)
          </div>
        </div>
        {selectedProductIds.length === 0 ? (
          <p className="mt-2 text-xs font-medium text-red-600">
            Sélectionnez au moins un produit.
          </p>
        ) : null}
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nom de la promotion">
          <input
            name="label"
            value={values.label}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-200 px-4 py-3"
          />
        </Field>
        <Field label="Type de promotion">
          <select
            name="type"
            value={values.type}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-4 py-3"
          >
            <option value="REDUCTION">Réduction</option>
            <option value="BUY_X_GET_N">
              Acheter X, recevoir N gratuitement
            </option>
          </select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Début de validité">
          <input
            type="datetime-local"
            name="startDateTime"
            value={values.startDateTime}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-200 px-4 py-3"
          />
        </Field>
        <Field label="Fin de validité">
          <input
            type="datetime-local"
            name="endDateTime"
            value={values.endDateTime}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-200 px-4 py-3"
          />
        </Field>
        <Field label="Péremption maximale des lots">
          <input
            type="date"
            name="limitDate"
            value={values.limitDate}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-4 py-3"
          />
        </Field>
      </div>

      {values.type === 'REDUCTION' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Valeur de la réduction">
            <input
              type="number"
              min="0.01"
              step="0.01"
              name="value"
              value={values.value}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 px-4 py-3"
            />
          </Field>
          <Field label="Unité">
            <select
              name="unit"
              value={values.unit}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-4 py-3"
            >
              <option value="PERCENT">Pourcentage</option>
              <option value="FIXED">Montant fixe (Ar)</option>
            </select>
          </Field>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Quantité achetée">
            <input
              type="number"
              min="1"
              name="buyQuantity"
              value={values.buyQuantity}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 px-4 py-3"
            />
          </Field>
          <Field label="Quantité offerte">
            <input
              type="number"
              min="1"
              name="freeQuantity"
              value={values.freeQuantity}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 px-4 py-3"
            />
          </Field>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-3 font-semibold text-teal-700"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting || selectedProductIds.length === 0}
          className="rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white disabled:bg-teal-300"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block space-y-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  )
}
