import { useState, type ChangeEvent, type FormEvent } from 'react'
import { TextField } from '../../components/TextField'
import type { Product } from '../products/productsApi'
import type { Supplier } from '../suppliers/suppliersApi'
import type { Inventory, InventoryPayload } from './inventoriesApi'

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
  products: Product[]
  suppliers: Supplier[]
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (payload: InventoryPayload) => Promise<void>
}

function toDateInputValue(value: string | null | undefined): string {
  if (!value) {
    return ''
  }

  return value.slice(0, 10)
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
}: InventoryFormProps) {
  const [values, setValues] = useState<InventoryFormValues>(() =>
    getInitialValues(inventory),
  )

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const name = event.target.name as keyof InventoryFormValues
    const { value } = event.target

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  function handleSelectChange(event: ChangeEvent<HTMLSelectElement>): void {
    const name = event.target.name as keyof InventoryFormValues
    const { value } = event.target

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

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
        <SelectField
          id="inventory-product"
          name="productId"
          label="Produit"
          value={values.productId}
          required
          options={products.map((product) => ({
            id: product.id,
            label: `${product.name} (${product.reference})`,
          }))}
          placeholder="Sélectionner un produit"
          onChange={handleSelectChange}
        />
        <SelectField
          id="inventory-supplier"
          name="supplierId"
          label="Fournisseur"
          value={values.supplierId}
          required
          options={suppliers.map((supplier) => ({
            id: supplier.id,
            label: supplier.name,
          }))}
          placeholder="Sélectionner un fournisseur"
          onChange={handleSelectChange}
        />
      </div>

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
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting || products.length === 0 || suppliers.length === 0}
          className="rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-teal-300"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}

interface SelectFieldProps {
  id: string
  name: keyof InventoryFormValues
  label: string
  value: string
  placeholder: string
  required?: boolean
  options: {
    id: number
    label: string
  }[]
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
}

function SelectField({
  id,
  name,
  label,
  value,
  placeholder,
  required = false,
  options,
  onChange,
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        required={required}
        onChange={onChange}
        className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
