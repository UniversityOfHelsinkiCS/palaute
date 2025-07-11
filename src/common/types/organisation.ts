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
  parentId: string
}

export type OrganisationWithAccess = {
  access: OrganisationAccess
  organisation: Organisation
}
