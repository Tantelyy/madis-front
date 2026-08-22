import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  SearchableSelectField,
  type SearchableSelectOption,
} from '../../components/SearchableSelectField'
import { TextField } from '../../components/TextField'
import type {
  Inventory,
  InventoryPayload,
  InventoryProductOption,
  InventorySupplierOption,
} from './inventoriesApi'

interface InventoryFormValues {
  productId: string
  supplierId: string
  quantity: string
  purchasePrice: string
  salePrice: string
  wholesalePrice: string
  expiredAt: string
}

interface InventoryFormProps {
  inventory?: Inventory
  products: InventoryProductOption[]
  suppliers: InventorySupplierOption[]
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (payload: InventoryPayload) => Promise<void>
  onCreateSupplier: (name: string) => Promise<SearchableSelectOption>
}

type SelectOption = SearchableSelectOption

function toDateInputValue(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : ''
}

function getInitialValues(inventory?: Inventory): InventoryFormValues {
  return {
    productId: inventory ? String(inventory.productId) : '',
    supplierId: inventory ? String(inventory.supplierId) : '',
    quantity: inventory ? String(inventory.quantity) : '',
    purchasePrice: inventory ? String(Number(inventory.purchasePrice)) : '',
    salePrice: inventory ? String(Number(inventory.salePrice)) : '',
    wholesalePrice: inventory ? String(Number(inventory.wholesalePrice)) : '',
    expiredAt: toDateInputValue(inventory?.expiredAt),
  }
}

function optionalNumber(value: string): number | undefined {
  const trimmedValue = value.trim()

  return trimmedValue ? Number(trimmedValue) : undefined
}

export function InventoryForm({
  inventory,
  products,
  suppliers,
  isSubmitting,
  onCancel,
  onSubmit,
  onCreateSupplier,
}: InventoryFormProps) {
  const [values, setValues] = useState<InventoryFormValues>(() =>
    getInitialValues(inventory),
  )
  const [formError, setFormError] = useState<string>('')
  const productOptions = useMemo<SelectOption[]>(
    () =>
      products.map((product) => ({
        id: product.id,
        label: `${product.name} (${product.reference})`,
      })),
    [products],
  )
  const supplierOptions = useMemo<SelectOption[]>(
    () =>
      suppliers.map((supplier) => ({
        id: supplier.id,
        label: supplier.name,
      })),
    [suppliers],
  )

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const name = event.target.name as keyof InventoryFormValues
    const { value } = event.target

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    if (!values.productId || !values.supplierId) {
      setFormError(
        'Sélectionnez un produit et un fournisseur dans les résultats de recherche.',
      )
      return
    }

    setFormError('')
    await onSubmit({
      productId: Number(values.productId),
      supplierId: Number(values.supplierId),
      quantity: Number(values.quantity),
      purchasePrice: Number(values.purchasePrice),
      salePrice: optionalNumber(values.salePrice),
      wholesalePrice: optionalNumber(values.wholesalePrice),
      expiredAt: values.expiredAt || null,
    })
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <SearchableSelectField
          id="inventory-product"
          label="Produit"
          value={values.productId}
          required
          disabled={isSubmitting}
          options={productOptions}
          placeholder="Rechercher par nom ou référence"
          onValueChange={(value) => {
            setFormError('')
            setValues((currentValues) => ({
              ...currentValues,
              productId: value,
            }))
          }}
        />
        <SearchableSelectField
          id="inventory-supplier"
          label="Fournisseur"
          value={values.supplierId}
          required
          disabled={isSubmitting}
          options={supplierOptions}
          placeholder="Rechercher un fournisseur"
          createLabel="Ajouter le fournisseur"
          onValueChange={(value) => {
            setFormError('')
            setValues((currentValues) => ({
              ...currentValues,
              supplierId: value,
            }))
          }}
          onCreateOption={onCreateSupplier}
        />
      </div>

      {formError ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {formError}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          id="inventory-quantity"
          name="quantity"
          label="Quantité"
          type="number"
          value={values.quantity}
          required
          onChange={handleInputChange}
        />
        <TextField
          id="inventory-purchase-price"
          name="purchasePrice"
          label="Prix d'achat unitaire"
          type="number"
          value={values.purchasePrice}
          required
          onChange={handleInputChange}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <TextField
          id="inventory-sale-price"
          name="salePrice"
          label="Prix de vente unitaire"
          type="number"
          value={values.salePrice}
          placeholder="Automatique si vide"
          onChange={handleInputChange}
        />
        <TextField
          id="inventory-wholesale-price"
          name="wholesalePrice"
          label="Prix de vente en gros"
          type="number"
          value={values.wholesalePrice}
          placeholder="Automatique si vide"
          onChange={handleInputChange}
        />
        <TextField
          id="inventory-expired-at"
          name="expiredAt"
          label="Date d'expiration"
          type="date"
          value={values.expiredAt}
          onChange={handleInputChange}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50 disabled:opacity-60"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={
            isSubmitting || products.length === 0 || suppliers.length === 0
          }
          className="rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-teal-300"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
