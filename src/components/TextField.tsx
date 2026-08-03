import type {
  ChangeEventHandler,
  HTMLInputTypeAttribute,
  ReactNode,
} from 'react'

interface TextFieldProps {
  id: string
  label: string
  name: string
  value: string
  type?: HTMLInputTypeAttribute
  autoComplete?: string
  placeholder?: string
  required?: boolean
  leadingIcon?: ReactNode
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
  leadingIcon,
  onChange,
}: TextFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        {leadingIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-500">
            {leadingIcon}
          </span>
        ) : null}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          onChange={onChange}
          className={`block w-full rounded-lg border border-slate-200 bg-white py-3 pr-4 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 ${
            leadingIcon ? 'pl-11' : 'pl-4'
          }`}
        />
      </div>
    </div>
  )
}
