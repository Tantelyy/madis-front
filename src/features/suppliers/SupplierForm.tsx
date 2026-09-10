import { useState, type ChangeEvent, type FormEvent } from 'react'
import { TextField } from '../../components/TextField'
import type { Supplier, SupplierPayload } from './suppliersApi'

interface SupplierFormValues {
  name: string
  address: string
  email: string
  phone: string
}

interface SupplierFormProps {
  supplier?: Supplier
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (payload: SupplierPayload) => Promise<void>
}

function getInitialValues(supplier?: Supplier): SupplierFormValues {
  return {
    name: supplier?.name ?? '',
    address: supplier?.address ?? '',
    email: supplier?.email ?? '',
    phone: supplier?.phone ?? '',
  }
}

function optionalValue(value: string): string | undefined {
  const trimmedValue = value.trim()

  return trimmedValue ? trimmedValue : undefined
}

export function SupplierForm({
  supplier,
  isSubmitting,
  onCancel,
  onSubmit,
}: SupplierFormProps) {
  const [values, setValues] = useState<SupplierFormValues>(() =>
    getInitialValues(supplier),
  )

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const name = event.target.name as keyof SupplierFormValues
    const { value } = event.target

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    await onSubmit({
      name: values.name.trim(),
      address: optionalValue(values.address),
      email: optionalValue(values.email),
      phone: optionalValue(values.phone),
    })
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <TextField
        id="supplier-name"
        name="name"
        label="Nom"
        value={values.name}
        placeholder="Nom du fournisseur"
        required
        onChange={handleChange}
      />
      <TextField
        id="supplier-address"
        name="address"
        label="Adresse"
        value={values.address}
        placeholder="Adresse"
        onChange={handleChange}
      />
      <TextField
        id="supplier-email"
        name="email"
        label="Email"
        type="email"
        value={values.email}
        placeholder="contact@fournisseur.com"
        onChange={handleChange}
      />
      <TextField
        id="supplier-phone"
        name="phone"
        label="Téléphone"
        value={values.phone}
        placeholder="+261..."
        onChange={handleChange}
      />

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
          disabled={isSubmitting}
          className="rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-teal-300"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
