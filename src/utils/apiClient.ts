import { API_BASE_URL } from '../auth/authApi'
import { redirectToLogin } from '../auth/loginRedirect'

interface BackendErrorResponse {
  message?: string | string[]
  error?: string
  statusCode?: number
}

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

async function handleErrorResponse(response: Response): Promise<never> {
  const message = formatBackendError(await readErrorBody(response))

  if (response.status === 401 || response.status === 403) {
    redirectToLogin(message)
  }

  throw new Error(message)
}

export async function requestJson<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
  } catch {
    throw new Error(
      'Impossible de contacter le serveur. Vérifiez que le backend est démarré.',
    )
  }

  if (!response.ok) {
    await handleErrorResponse(response)
  }

  return response.json() as Promise<TResponse>
}

export async function requestEmpty(
  path: string,
  init?: RequestInit,
): Promise<void> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      ...init,
      headers: {
        ...init?.headers,
      },
    })
  } catch {
    throw new Error(
      'Impossible de contacter le serveur. Vérifiez que le backend est démarré.',
    )
  }

  if (!response.ok) {
    await handleErrorResponse(response)
  }
}

export async function requestBlob(
  path: string,
  init?: RequestInit,
): Promise<Blob> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
  } catch {
    throw new Error(
      'Impossible de contacter le serveur. Vérifiez que le backend est démarré.',
    )
  }

  if (!response.ok) {
    await handleErrorResponse(response)
  }

  return response.blob()
}
