import type { OrganisationWithAccess } from './organisation'

export interface User {
  id: string
  email: string | null
  firstName?: string
  lastName?: string
}

export type LoggedInUser = User & {
  iamGroups: string[]
  lastRestart: Date
  banners: any[]
  organisations: OrganisationWithAccess[]
  preferences: UserPreferences
  isTeacherOnSomeCourse: boolean
}

export type UserPreferences = {
  hasSummaryAccess: boolean
  hasCourseAccess: boolean
  summaryView: string
  defaultView: string
}
