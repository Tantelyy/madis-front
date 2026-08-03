import type { ReactNode } from 'react'
import { Modal } from '../../components/Modal'

interface ProductModalProps {
  title: string
  children: ReactNode
  onClose: () => void
  errorMessage?: string
}

export function ProductModal(props: ProductModalProps) {
  return <Modal {...props} size="md" />
}
