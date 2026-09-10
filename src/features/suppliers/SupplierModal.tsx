import type { ReactNode } from 'react'
import { Modal } from '../../components/Modal'

interface SupplierModalProps {
  title: string
  children: ReactNode
  onClose: () => void
  errorMessage?: string
}

export function SupplierModal(props: SupplierModalProps) {
  return <Modal {...props} size="md" />
}
