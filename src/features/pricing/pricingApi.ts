import { API_BASE_URL } from '../../auth/authApi'

export type PricingGridStatus = 'ACTIVE' | 'ARCHIVED' | 'DRAFT'

export interface PricingRule {
  id: number
  pricingGridId: number
  minPurchasePrice: number
  maxPurchasePrice: number
  retailMarginPercent: string
  wholesaleMarginPercent: string
  retailAverage: string
  wholesaleAverage: string
}

export interface PricingGrid {
  id: number
  status: PricingGridStatus
  effectiveFrom: string
  effectiveTo: string | null
  createdAt: string
  createdBy: number
  updatedAt: string
  pricingRules: PricingRule[]
}

export interface PricingRulePayload {
  minPurchasePrice: number
  maxPurchasePrice: number
  retailMarginPercent: number
  wholesaleMarginPercent: number
}

export interface UpdatePricingGridPayload {
  pricingRules: PricingRulePayload[]
}

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

async function requestJson<TResponse>(
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
    throw new Error(formatBackendError(await readErrorBody(response)))
  }

  return response.json() as Promise<TResponse>
}

export function getActivePricingGrid(): Promise<PricingGrid> {
  return requestJson<PricingGrid>('/pricing-grids/active')
}

export function updatePricingGrid(
  payload: UpdatePricingGridPayload,
): Promise<PricingGrid> {
  return requestJson<PricingGrid>('/pricing-grids', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
