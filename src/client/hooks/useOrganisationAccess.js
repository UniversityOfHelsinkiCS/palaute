import useOrganisations from './useOrganisations'

const useOrganisationAccess = feedbackTarget => {
  const { organisations, isLoading } = useOrganisations()
  if (isLoading || !feedbackTarget) return {}
  const orgIds = feedbackTarget?.courseUnit?.organisations.map(org => org.id)
  return organisations.find(org => orgIds.some(id => id === org.id))?.access || {}
}

export default useOrganisationAccess
