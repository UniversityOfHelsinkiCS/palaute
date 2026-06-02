import type { LanguageId } from './common'
import type { OrganisationAccess, OrganisationWithAccess } from './organisation'
import type { BannerRecord } from './banner'

export interface User {
  id: string
  email: string | null
  firstName?: string
  lastName?: string
  language?: LanguageId | null
}

// Wire type for GET /login — mirrors what userController sends over JSON.
// Dates serialise to ISO strings, so lastRestart is string, not Date.
export type LoggedInUser = User & {
  iamGroups: string[]
  lastRestart: string
  banners: BannerRecord[]
  organisations: OrganisationWithAccess[]
  preferences: UserPreferences
  serverVersion?: string
  organisationAccess?: Record<string, OrganisationAccess>
}

export type UserPreferences = {
  hasSummaryAccess: boolean
  hasCourseAccess: boolean
  summaryView: string
  defaultView: string
}
