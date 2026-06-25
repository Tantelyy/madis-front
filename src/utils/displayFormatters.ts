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

export function displayValue(value: string | null | undefined): string {
  return value?.trim() ? value : '-'
}

export function formatUser(user: DisplayUser | null | undefined): string {
  if (!user) {
    return '-'
  }

  return `${user.userName} (${user.email})`
}
