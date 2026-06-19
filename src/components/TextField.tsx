import type { ChangeEventHandler, HTMLInputTypeAttribute } from 'react'

interface TextFieldProps {
  id: string
  label: string
  name: string
  value: string
  type?: HTMLInputTypeAttribute
  autoComplete?: string
  placeholder?: string
  required?: boolean
  onChange: ChangeEventHandler<HTMLInputElement>
}

export function TextField({
  id,
  label,
  name,
  value,
  type = 'text',
  autoComplete,
  placeholder,
  required = false,
  onChange,
}: TextFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        onChange={onChange}
        className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
      />
    </div>
  )
}
