import type { ReactNode } from 'react'

interface ProductModalProps {
  title: string
  children: ReactNode
  onClose: () => void
}

export function ProductModal({ title, children, onClose }: ProductModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div className="max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2
            id="product-modal-title"
            className="text-lg font-bold text-slate-950"
          >
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
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
