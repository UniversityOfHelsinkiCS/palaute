import type { OrganisationAccess } from '@common/types/organisation'

import useAuthorizedUser from './useAuthorizedUser'

const useUserOrganisationAccess = (): Record<string, OrganisationAccess> => {
  const { authorizedUser, isLoading } = useAuthorizedUser()

  if (isLoading || !authorizedUser) return {}

  return authorizedUser.organisationAccess ?? {}
}

export const useUserOrganisationAccessByCode = (organisationCode: string): OrganisationAccess => {
  const access = useUserOrganisationAccess()
  return access[organisationCode] ?? {}
}
