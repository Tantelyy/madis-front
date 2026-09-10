import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react'
import { AppIcon } from '../../components/AppIcon'
import {
  SearchableSelectField,
  type SearchableSelectOption,
} from '../../components/SearchableSelectField'
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
  productIds: string[]
  productIdOffer: string
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
    productIds: offer?.productIds.map(String) ?? [],
    productIdOffer: offer?.productIdOffer ? String(offer.productIdOffer) : '',
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

function buildProductOption(product: SaleCatalogProduct): SearchableSelectOption {
  return {
    id: product.id,
    label: `${product.name} — ${product.reference} (stock : ${product.totalStock})`,
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
  const [selectionError, setSelectionError] = useState<string>('')
  const productOptions = useMemo(
    () => products.map(buildProductOption),
    [products],
  )
  const selectedOfferedProduct = products.find(
    (product) => String(product.id) === values.productIdOffer,
  )

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void {
    const name = event.target.name as keyof FormValues
    setValues((currentValues) => ({
      ...currentValues,
      [name]: event.target.value,
    }))
    setSelectionError('')
  }

  function setProductValue(field: 'productIdOffer', value: string): void {
    setValues((currentValues) => ({ ...currentValues, [field]: value }))
    setSelectionError('')
  }

  function togglePromotionProduct(productId: string): void {
    setValues((currentValues) => ({
      ...currentValues,
      productIds: currentValues.productIds.includes(productId)
        ? currentValues.productIds.filter((id) => id !== productId)
        : [...currentValues.productIds, productId],
    }))
    setSelectionError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const productIds = values.productIds.map(Number)

    if (
      productIds.length === 0 ||
      productIds.some(
        (productId) => !Number.isInteger(productId) || productId <= 0,
      )
    ) {
      setSelectionError(
        'Sélectionnez au moins un produit concerné par la promotion.',
      )
      return
    }

    const payload: SpecialOfferPayload = {
      productIds,
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
      const productIdOffer = Number(values.productIdOffer)
      const freeQuantity = Number(values.freeQuantity)

      if (!Number.isInteger(productIdOffer) || productIdOffer <= 0) {
        setSelectionError('Sélectionnez le produit à donner gratuitement.')
        return
      }

      if (
        !Number.isInteger(freeQuantity) ||
        freeQuantity <= 0 ||
        !selectedOfferedProduct ||
        selectedOfferedProduct.totalStock < freeQuantity
      ) {
        setSelectionError(
          'Le produit offert doit avoir la quantité gratuite demandée en stock.',
        )
        return
      }

      payload.buyQuantity = Number(values.buyQuantity)
      payload.freeQuantity = freeQuantity
      payload.productIdOffer = productIdOffer
    }

    await onSubmit(payload)
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <PromotionProductMultiSelect
        selectedProductIds={values.productIds}
        options={productOptions}
        onToggle={togglePromotionProduct}
      />

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
        <SelectField label="Type de promotion">
          <select
            name="type"
            value={values.type}
            onChange={handleChange}
            className="w-full appearance-none rounded-lg border border-slate-200 px-4 py-3 pr-10"
          >
            <option value="REDUCTION">Réduction</option>
            <option value="BUY_X_GET_N">
              Acheter X, recevoir N gratuitement
            </option>
          </select>
        </SelectField>
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
          <SelectField label="Unité">
            <select
              name="unit"
              value={values.unit}
              onChange={handleChange}
              className="w-full appearance-none rounded-lg border border-slate-200 px-4 py-3 pr-10"
            >
              <option value="PERCENT">Pourcentage</option>
              <option value="FIXED">Montant fixe (Ar)</option>
            </select>
          </SelectField>
        </div>
      ) : (
        <>
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
          <SearchableSelectField
            id="special-offer-gift-product"
            label="Produit à donner gratuitement"
            value={values.productIdOffer}
            options={productOptions}
            placeholder="Rechercher le produit offert"
            required
            onValueChange={(value) => setProductValue('productIdOffer', value)}
          />
          {selectedOfferedProduct ? (
            <p className="text-xs font-medium text-slate-500">
              Stock disponible : {selectedOfferedProduct.totalStock}
            </p>
          ) : null}
        </>
      )}

      {selectionError ? (
        <p className="text-sm font-medium text-red-600">{selectionError}</p>
      ) : null}

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
          disabled={isSubmitting || values.productIds.length === 0}
          className="rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white disabled:bg-teal-300"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}

function PromotionProductMultiSelect({
  selectedProductIds,
  options,
  onToggle,
}: {
  selectedProductIds: readonly string[]
  options: readonly SearchableSelectOption[]
  onToggle: (productId: string) => void
}) {
  const [search, setSearch] = useState<string>('')
  const normalizedSearch = search.trim().toLocaleLowerCase('fr')
  const visibleOptions = normalizedSearch
    ? options.filter((option) =>
        option.label.toLocaleLowerCase('fr').includes(normalizedSearch),
      )
    : options
  const selectedOptions = options.filter((option) =>
    selectedProductIds.includes(String(option.id)),
  )

  return (
    <div className="space-y-2">
      <label
        htmlFor="special-offer-products"
        className="block text-sm font-medium text-slate-700"
      >
        Produits concernés par la promotion *
      </label>
      <input
        id="special-offer-products"
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Rechercher un produit par nom ou référence"
        className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
      />
      <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-200 bg-white">
        {visibleOptions.length === 0 ? (
          <p className="px-4 py-3 text-sm text-slate-500">
            Aucun produit trouvé.
          </p>
        ) : (
          visibleOptions.map((option) => {
            const productId = String(option.id)

            return (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-4 py-3 text-sm text-slate-700 last:border-0 hover:bg-teal-50"
              >
                <input
                  type="checkbox"
                  checked={selectedProductIds.includes(productId)}
                  onChange={() => onToggle(productId)}
                  className="h-4 w-4 accent-teal-700"
                />
                <span>{option.label}</span>
              </label>
            )
          })
        )}
      </div>
      <p className="text-xs font-medium text-slate-500">
        {selectedOptions.length} produit
        {selectedOptions.length > 1 ? 's' : ''} sélectionné
        {selectedOptions.length > 1 ? 's' : ''}
      </p>
      {selectedOptions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(String(option.id))}
              className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 hover:bg-teal-100"
            >
              {option.label} ×
            </button>
          ))}
        </div>
      ) : null}
    </div>
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

function SelectField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block space-y-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <span className="relative block">
        {children}
        <AppIcon
          name="chevron-down"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
        />
      </span>
    </label>
  )
}
