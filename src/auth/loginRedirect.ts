import { clearStoredUser } from './sessionStorage'

const LOGIN_REDIRECT_MESSAGE_KEY = 'madis.auth.redirectMessage'

export function consumeLoginRedirectMessage(): string {
  const message = window.sessionStorage.getItem(LOGIN_REDIRECT_MESSAGE_KEY)

  if (message) {
    window.sessionStorage.removeItem(LOGIN_REDIRECT_MESSAGE_KEY)
  }

  return message ?? ''
}

export function storeLoginRedirectMessage(message: string): void {
  window.sessionStorage.setItem(LOGIN_REDIRECT_MESSAGE_KEY, message)
}

export function redirectToLogin(message: string): never {
  clearStoredUser()
  storeLoginRedirectMessage(message)

  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }

  throw new Error(message)
}
