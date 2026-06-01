import type { LanguageId } from './common'
import type { OrganisationWithAccess } from './organisation'

export interface User {
  id: string
  email: string | null
  firstName?: string
  lastName?: string
  language?: LanguageId | null
}

export type LoggedInUser = User & {
  iamGroups: string[]
  lastRestart: Date
  banners: any[]
  organisations: OrganisationWithAccess[]
  preferences: UserPreferences
  serverVersion?: string
}

export type UserPreferences = {
  hasSummaryAccess: boolean
  hasCourseAccess: boolean
  summaryView: string
  defaultView: string
}
