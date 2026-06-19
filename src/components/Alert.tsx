interface AlertProps {
  message: string
  type: 'error' | 'success'
}

const alertStyles: Record<AlertProps['type'], string> = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
}

export function Alert({ message, type }: AlertProps) {
  return (
    <p
      role={type === 'error' ? 'alert' : 'status'}
      className={`rounded-lg border px-4 py-3 text-sm font-medium ${alertStyles[type]}`}
    >
      {message}
    </p>
  )
}
