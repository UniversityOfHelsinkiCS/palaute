import type { BannerRecord } from './banner'
import type { LanguageId } from './common'
import type { OrganisationAccess, OrganisationWithAccess } from './organisation'

export type User = {
  id: string
  email: string | null
  firstName?: string
  lastName?: string
  language?: LanguageId | null
}

// GET /user (noad)
export type GetNoadUserResponse = User

// GET /login
export type GetLoginResponse = User & {
  username: string
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

// GET /users/:id
export type GetUserDetailsResponse = User & {
  username: string
  secondaryEmail?: string | null
  studentNumber?: string | null
  degreeStudyRight?: boolean | null
  norppaFeedbackGiven?: boolean
  lastLoggedIn?: string | null
  createdAt: string
  updatedAt: string
  iamGroups: string[]
  access: OrganisationWithAccess[]
}
