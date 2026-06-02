import type { LocalizedString } from './common'

export type OrganisationAccess = {
  read?: boolean
  write?: boolean
  admin?: boolean
}

export interface Organisation {
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
