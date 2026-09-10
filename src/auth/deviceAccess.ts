import type { UserRole } from './authApi'

const DESKTOP_ONLY_ROLES: ReadonlySet<UserRole> = new Set([
  'SELLER',
  'STOCK_MANAGER',
])
const MOBILE_USER_AGENT_PATTERN =
  /android|blackberry|iemobile|ipad|iphone|ipod|mobile|opera mini|tablet|webos/i

interface NavigatorUserAgentData {
  mobile: boolean
}

type NavigatorWithUserAgentData = Navigator & {
  userAgentData?: NavigatorUserAgentData
}

export const DESKTOP_ONLY_ACCESS_MESSAGE =
  'Ce compte est accessible uniquement depuis un navigateur sur ordinateur.'

export function isMobileBrowser(): boolean {
  const navigatorWithClientHints = navigator as NavigatorWithUserAgentData

  return (
    navigatorWithClientHints.userAgentData?.mobile === true ||
    MOBILE_USER_AGENT_PATTERN.test(navigator.userAgent)
  )
}

export function canRoleUseCurrentDevice(role: UserRole): boolean {
  return !DESKTOP_ONLY_ROLES.has(role) || !isMobileBrowser()
}
