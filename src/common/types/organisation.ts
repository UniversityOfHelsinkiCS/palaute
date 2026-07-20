import type { LocalizedString } from './common'
import type { Question } from './question'

export type OrganisationAccess = {
  read?: boolean
  write?: boolean
  admin?: boolean
}

export type Organisation = {
  id: string
  name: LocalizedString
  code: string
  parentId: string | null
}

// Nested shape — used in LoggedInUser.organisations (GET /login)
export type OrganisationWithAccess = {
  access: OrganisationAccess
  organisation: Organisation
}

export type Tag = {
  id: number
  name: LocalizedString
  hash: number
}

export type OrganisationMember = {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
}

// GET /organisations
export type GetOrganisationsResponse = Array<
  Organisation & {
    access: OrganisationAccess
    studentListVisible?: boolean
    studentListVisibleByCourse?: boolean
    disabledCourseCodes?: string[]
  }
>

// GET /organisations/:code
export type GetOrganisationResponse = Organisation & {
  access: OrganisationAccess
  tags: Tag[]
  users: OrganisationMember[]
  studentListVisible?: boolean
  studentListVisibleByCourse?: boolean
  disabledCourseCodes?: string[]
  publicQuestionIds?: number[]
}

type OrganisationLogEntry = {
  data: Record<string, unknown>
  createdAt: string
  user?: OrganisationMember
}

// GET /organisations/:code/logs
export type GetOrganisationLogsResponse = OrganisationLogEntry[]

// GET /organisations/:code/open
export type GetOrganisationOpenQuestionsResponse = Array<{
  code: string
  name: LocalizedString
  realisations: Array<{
    id: number
    name: LocalizedString
    startDate: string
    endDate: string
    questions: Array<{ question: Question; responses: string[] }>
  }>
}>
