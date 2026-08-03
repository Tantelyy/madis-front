import type { ReactNode } from 'react'
import { Modal, type ModalSize } from '../../components/Modal'

interface InventoryModalProps {
  title: string
  children: ReactNode
  onClose: () => void
  size?: ModalSize
  errorMessage?: string
  successMessage?: string
}

export function InventoryModal(props: InventoryModalProps) {
  return <Modal {...props} size={props.size ?? 'lg'} />
}
