import { useId, type ReactNode } from 'react'
import { Alert } from './Alert'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

interface ModalProps {
  title: string
  children: ReactNode
  onClose: () => void
  size?: ModalSize
  errorMessage?: string
  successMessage?: string
}

const MODAL_WIDTHS: Readonly<Record<ModalSize, string>> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
}

export function Modal({
  title,
  children,
  onClose,
  size = 'md',
  errorMessage = '',
  successMessage = '',
}: ModalProps) {
  const titleId = useId()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className={`max-h-[calc(100vh-3rem)] w-full ${MODAL_WIDTHS[size]} overflow-y-auto rounded-lg bg-white shadow-xl`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <h2 id={titleId} className="text-lg font-bold text-slate-950">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-teal-50 hover:text-teal-700"
          >
            Fermer
          </button>
        </div>
        <div className="space-y-4 p-5">
          {errorMessage ? <Alert type="error" message={errorMessage} /> : null}
          {successMessage ? (
            <Alert type="success" message={successMessage} />
          ) : null}
          {children}
        </div>
      </div>
    </div>
  )
}
