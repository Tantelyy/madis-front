export interface LoginCredentials {
  email: string
  password: string
}

export type UserRole = 'ADMIN' | 'SELLER' | 'STOCK_MANAGER'

export interface AuthenticatedUser {
  id: number
  email: string
  userName: string
  role: UserRole
  permissions: string[]
}

export interface LoginResponse {
  message: string
  user: AuthenticatedUser
}

interface BackendErrorResponse {
  message?: string | string[]
  error?: string
  statusCode?: number
}

export const API_BASE_URL = (
  import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

function isBackendErrorResponse(value: unknown): value is BackendErrorResponse {
  return typeof value === 'object' && value !== null
}

function formatBackendError(errorBody: unknown): string {
  if (!isBackendErrorResponse(errorBody)) {
    return 'Une erreur est survenue. Veuillez réessayer.'
  }

  if (Array.isArray(errorBody.message)) {
    return errorBody.message.join(' ')
  }

  if (typeof errorBody.message === 'string') {
    return errorBody.message
  }

  if (typeof errorBody.error === 'string') {
    return errorBody.error
  }

  return 'Une erreur est survenue. Veuillez réessayer.'
}

async function readErrorBody(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })
  } catch {
    throw new Error(
      'Impossible de contacter le serveur. Vérifiez que le backend est démarré.',
    )
  }

  if (!response.ok) {
    throw new Error(formatBackendError(await readErrorBody(response)))
  }

  return response.json() as Promise<LoginResponse>
}

export async function logout(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(formatBackendError(await readErrorBody(response)))
    }
  } catch {
    throw new Error(
      'Impossible de fermer la session pour le moment. Veuillez réessayer.',
    )
  }
}
