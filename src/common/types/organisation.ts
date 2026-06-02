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

// Nested shape — used in LoginResponse.organisations
export type OrganisationWithAccess = {
  access: OrganisationAccess
  organisation: Organisation
}

// Flat shape — returned by GET /organisations (spreads organisation fields + access)
export type UserOrganisation = Organisation & {
  access: OrganisationAccess
  studentListVisible?: boolean
  studentListVisibleByCourse?: boolean
  disabledCourseCodes?: string[]
}

export type Tag = {
  id: number
  name: LocalizedString
  hash: string
}

export type OrganisationMember = {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
}

// Detailed shape — returned by GET /organisations/:code
export type UserOrganisationDetail = Organisation & {
  access: OrganisationAccess
  tags: Tag[]
  users: OrganisationMember[]
  studentListVisible?: boolean
  studentListVisibleByCourse?: boolean
  disabledCourseCodes?: string[]
  publicQuestionIds?: number[]
}

export type OrganisationLog = {
  data: Record<string, unknown>
  createdAt: string
  user: OrganisationMember
}
