export type LanguageId = 'fi' | 'en' | 'sv'

export type LocalizedString = {
  en?: string
  fi?: string
  sv?: string
}

export type OrganisationAccess = {
  read?: boolean
  write?: boolean
  admin?: boolean
}
