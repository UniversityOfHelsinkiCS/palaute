import useOrganisations from './useOrganisations'

/**
 * Finds the organisation access object (read, write, admin) for the given feedback target.
 * @param {*} feedbackTarget
 * @returns the access object { read: boolean, write: boolean, admin: boolean }
 */
const useOrganisationAccess = feedbackTarget => {
  const { organisations, isLoading } = useOrganisations()
  if (isLoading || !feedbackTarget) return {}
  const orgIds = feedbackTarget?.courseUnit?.organisations.map(org => org.id)
  return organisations.find(org => orgIds.some(id => id === org.id))?.access || {}
}

export default useOrganisationAccess
