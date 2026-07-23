import {
  useMemo,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react'

export interface SearchableSelectOption {
  id: number
  label: string
}

interface SearchableSelectFieldProps {
  id: string
  label: string
  value: string
  options: readonly SearchableSelectOption[]
  placeholder: string
  required?: boolean
  disabled?: boolean
  createLabel?: string
  emptyMessage?: string
  onValueChange: (value: string) => void
  onCreateOption?: (label: string) => Promise<SearchableSelectOption>
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLocaleLowerCase('fr')
}

export function SearchableSelectField({
  id,
  label,
  value,
  options,
  placeholder,
  required = false,
  disabled = false,
  createLabel,
  emptyMessage = 'Aucun résultat trouvé.',
  onValueChange,
  onCreateOption,
}: SearchableSelectFieldProps) {
  const selectedOption = options.find((option) => String(option.id) === value)
  const [query, setQuery] = useState<string>(selectedOption?.label ?? '')
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const listboxId = `${id}-options`

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query)

    if (!normalizedQuery) {
      return options
    }

    return options.filter((option) =>
      normalizeSearchText(option.label).includes(normalizedQuery),
    )
  }, [options, query])

  const canCreateOption =
    Boolean(createLabel && onCreateOption) &&
    query.trim().length > 0 &&
    !options.some(
      (option) =>
        normalizeSearchText(option.label) === normalizeSearchText(query),
    )

  function handleFocus(): void {
    setErrorMessage('')
    setIsOpen(true)
  }

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>): void {
    setQuery(event.target.value)
    setErrorMessage('')
    onValueChange('')
    setIsOpen(true)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Escape') {
      setIsOpen(false)
      setQuery(selectedOption?.label ?? '')
      return
    }

    if (event.key === 'Enter' && filteredOptions.length === 1) {
      event.preventDefault()
      handleSelect(filteredOptions[0])
    }
  }

  function handleBlur(): void {
    setIsOpen(false)

    if (!value) {
      setQuery('')
    }
  }

  function handleSelect(option: SearchableSelectOption): void {
    setQuery(option.label)
    setErrorMessage('')
    onValueChange(String(option.id))
    setIsOpen(false)
  }

  async function handleCreateOption(): Promise<void> {
    const trimmedQuery = query.trim()

    if (!trimmedQuery || !onCreateOption) {
      return
    }

    setIsCreating(true)
    setErrorMessage('')

    try {
      handleSelect(await onCreateOption(trimmedQuery))
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
        {required ? ' *' : ''}
      </label>
      <input
        id={id}
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-required={required}
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleQueryChange}
        onKeyDown={handleKeyDown}
        className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-100"
      />
      {errorMessage ? (
        <p className="text-xs font-semibold text-red-700">{errorMessage}</p>
      ) : null}
      {isOpen && !disabled ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {filteredOptions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500">{emptyMessage}</p>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={String(option.id) === value}
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
              onClick={() => void handleCreateOption()}
              className="block w-full border-t border-slate-200 px-4 py-3 text-left text-sm font-semibold text-teal-700 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              {isCreating
                ? 'Création...'
                : `${createLabel ?? 'Ajouter'} "${query.trim()}"`}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
