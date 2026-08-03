import type { ReactNode } from 'react'
import { Modal } from '../../components/Modal'

interface AccountModalProps {
  title: string
  children: ReactNode
  onClose: () => void
  errorMessage?: string
}

export function AccountModal(props: AccountModalProps) {
  return <Modal {...props} size="lg" />
}
