import useAuthorizedUser from './useAuthorizedUser'

/**
 *
 * @returns { [organisationId]: { read: boolean, write: boolean, admin: boolean } } user's access object to each accessible organisation
 */
const useUserOrganisationAccess = () => {
  const { authorizedUser, isLoading } = useAuthorizedUser()

  if (isLoading || !authorizedUser) return {}

  return authorizedUser.organisationAccess || {}
}

export const useUserOrganisationAccessByCode = organisationCode => {
  const access = useUserOrganisationAccess()

  return access[organisationCode] || {}
}
