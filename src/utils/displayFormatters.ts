export interface DisplayUser {
  userName: string
  email: string
}

export function formatDateTime(value: string | null): string {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatDate(value: string | null): string {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

export function formatPrice(value: string | null): string {
  if (value === null) {
    return '-'
  }

  return `${new Intl.NumberFormat('fr-FR').format(Number(value))} Ar`
}

export function displayValue(value: string | null | undefined): string {
  return value?.trim() ? value : '-'
}

export function formatUser(user: DisplayUser | null | undefined): string {
  if (!user) {
    return '-'
  }

  return `${user.userName} (${user.email})`
}
