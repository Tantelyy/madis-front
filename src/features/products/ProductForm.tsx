import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { TextField } from '../../components/TextField'
import type {
  Product,
  ProductFormat,
  ProductMark,
  ProductPayload,
  ProductSpecification,
  ProductType,
} from './productsApi'

interface ProductFormValues {
  reference: string
  markId: string
  specificationId: string
  formatId: string
  productTypeId: string
  image: string
}

interface SelectOption {
  id: number
  label: string
}

interface ProductFormProps {
  product?: Product
  marks: ProductMark[]
  specifications: ProductSpecification[]
  formats: ProductFormat[]
  types: ProductType[]
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (payload: ProductPayload) => Promise<void>
  onCreateMark: (label: string) => Promise<SelectOption>
  onCreateSpecification: (label: string) => Promise<SelectOption>
  onCreateFormat: (label: string) => Promise<SelectOption>
  onCreateType: (label: string) => Promise<SelectOption>
}

interface SearchableSelectFieldProps {
  id: string
  label: string
  value: string
  options: SelectOption[]
  placeholder: string
  createLabel: string
  onValueChange: (value: string) => void
  onCreateOption: (label: string) => Promise<SelectOption>
}

function optionalValue(value: string): string | undefined {
  const trimmedValue = value.trim()

  return trimmedValue ? trimmedValue : undefined
}

function getInitialValues(product?: Product): ProductFormValues {
  return {
    reference: product?.reference ?? '',
    markId: product?.markId ? String(product.markId) : '',
    specificationId: product?.specificationId
      ? String(product.specificationId)
      : '',
    formatId: product?.formatId ? String(product.formatId) : '',
    productTypeId: product?.productTypeId ? String(product.productTypeId) : '',
    image: product?.image ?? '',
  }
}

function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Impossible de lire cette image.'))
    }
    reader.onerror = () => reject(new Error('Impossible de lire cette image.'))
    reader.readAsDataURL(file)
  })
}

function SearchableSelectField({
  id,
  label,
  value,
  options,
  placeholder,
  createLabel,
  onValueChange,
  onCreateOption,
}: SearchableSelectFieldProps) {
  const selectedOption = options.find((option) => String(option.id) === value)
  const [query, setQuery] = useState<string>(selectedOption?.label ?? '')
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const filteredOptions = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase()

    if (!trimmedQuery) {
      return options
    }

    return options.filter((option) =>
      option.label.toLowerCase().includes(trimmedQuery),
    )
  }, [options, query])

  const canCreateOption =
    query.trim().length > 0 &&
    !options.some(
      (option) => option.label.toLowerCase() === query.trim().toLowerCase(),
    )

  function handleFocus(): void {
    setQuery(selectedOption?.label ?? '')
    setErrorMessage('')
    setIsOpen(true)
  }

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>): void {
    setQuery(event.target.value)
    setErrorMessage('')
    onValueChange('')
    setIsOpen(true)
  }

  function handleBlur(): void {
    window.setTimeout(() => setIsOpen(false), 100)
  }

  function handleSelect(option: SelectOption): void {
    setQuery(option.label)
    setErrorMessage('')
    onValueChange(String(option.id))
    setIsOpen(false)
  }

  async function handleCreateOption(): Promise<void> {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      return
    }

    setIsCreating(true)
    setErrorMessage('')

    try {
      const option = await onCreateOption(trimmedQuery)
      handleSelect(option)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible de créer cet élément.',
      )
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="relative space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={value}
        className="sr-only"
        readOnly
        tabIndex={-1}
      />
      <input
        type="search"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleQueryChange}
        className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
      />
      {errorMessage ? (
        <p className="text-xs font-semibold text-red-700">{errorMessage}</p>
      ) : null}
      {isOpen ? (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {filteredOptions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500">
              Aucun résultat trouvé.
            </p>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(option)}
                className={`block w-full px-4 py-3 text-left text-sm transition hover:bg-teal-50 ${
                  String(option.id) === value
                    ? 'bg-teal-100 font-semibold text-teal-900'
                    : 'text-slate-700'
                }`}
              >
                {option.label}
              </button>
            ))
          )}
          {canCreateOption ? (
            <button
              type="button"
              disabled={isCreating}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                void handleCreateOption()
              }}
              className="block w-full border-t border-slate-200 px-4 py-3 text-left text-sm font-semibold text-teal-700 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              {isCreating ? 'Création...' : `${createLabel} "${query.trim()}"`}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export function ProductForm({
  product,
  marks,
  specifications,
  formats,
  types,
  isSubmitting,
  onCancel,
  onSubmit,
  onCreateMark,
  onCreateSpecification,
  onCreateFormat,
  onCreateType,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(() =>
    getInitialValues(product),
  )
  const [formError, setFormError] = useState<string>('')

  const markOptions = useMemo(
    () => marks.map((mark) => ({ id: mark.id, label: mark.name })),
    [marks],
  )
  const specificationOptions = useMemo(
    () =>
      specifications.map((specification) => ({
        id: specification.id,
        label: specification.specification,
      })),
    [specifications],
  )
  const formatOptions = useMemo(
    () => formats.map((format) => ({ id: format.id, label: format.format })),
    [formats],
  )
  const typeOptions = useMemo(
    () => types.map((type) => ({ id: type.id, label: type.type })),
    [types],
  )

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const name = event.target.name as keyof ProductFormValues
    const { value } = event.target

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  function handleSelectChange(name: keyof ProductFormValues, value: string): void {
    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setFormError('Sélectionnez un fichier image valide.')
      return
    }

    try {
      const image = await readImageFile(file)
      setValues((currentValues) => ({
        ...currentValues,
        image,
      }))
      setFormError('')
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Impossible de lire ce fichier.',
      )
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    if (
      !values.markId ||
      !values.specificationId ||
      !values.formatId ||
      !values.productTypeId
    ) {
      setFormError(
        'Sélectionnez un type, une marque, une spécification et un format dans les listes.',
      )
      return
    }

    setFormError('')

    await onSubmit({
      reference: values.reference.trim(),
      markId: Number(values.markId),
      specificationId: Number(values.specificationId),
      formatId: Number(values.formatId),
      productTypeId: Number(values.productTypeId),
      image: optionalValue(values.image),
    })
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <TextField
        id="product-reference"
        name="reference"
        label="Référence"
        value={values.reference}
        placeholder="Référence du produit"
        required
        onChange={handleInputChange}
      />
      {formError ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {formError}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <SearchableSelectField
          id="product-type"
          label="Type"
          value={values.productTypeId}
          options={typeOptions}
          placeholder="Rechercher un type"
          createLabel="Ajouter le type"
          onValueChange={(value) => handleSelectChange('productTypeId', value)}
          onCreateOption={onCreateType}
        />
        <SearchableSelectField
          id="product-mark"
          label="Marque"
          value={values.markId}
          options={markOptions}
          placeholder="Rechercher une marque"
          createLabel="Ajouter la marque"
          onValueChange={(value) => handleSelectChange('markId', value)}
          onCreateOption={onCreateMark}
        />
        <SearchableSelectField
          id="product-specification"
          label="Spécification"
          value={values.specificationId}
          options={specificationOptions}
          placeholder="Rechercher une spécification"
          createLabel="Ajouter la spécification"
          onValueChange={(value) =>
            handleSelectChange('specificationId', value)
          }
          onCreateOption={onCreateSpecification}
        />
        <SearchableSelectField
          id="product-format"
          label="Format"
          value={values.formatId}
          options={formatOptions}
          placeholder="Rechercher un format"
          createLabel="Ajouter le format"
          onValueChange={(value) => handleSelectChange('formatId', value)}
          onCreateOption={onCreateFormat}
        />
      </div>

      <div className="space-y-3">
        <TextField
          id="product-image"
          name="image"
          label="Image"
          value={values.image}
          placeholder="URL de l'image ou image locale"
          onChange={handleInputChange}
        />
        <div className="space-y-2">
          <label
            htmlFor="product-image-file"
            className="block text-sm font-medium text-slate-700"
          >
            Image locale
          </label>
          <input
            id="product-image-file"
            type="file"
            accept="image/*"
            onChange={(event) => {
              void handleFileChange(event)
            }}
            className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-teal-700 hover:file:bg-teal-100 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          />
        </div>
        {values.image ? (
          <img
            src={values.image}
            alt="Aperçu du produit"
            className="h-32 w-32 rounded-lg border border-slate-200 object-cover"
          />
        ) : null}
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
          disabled={isSubmitting}
          className="rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-teal-300"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
