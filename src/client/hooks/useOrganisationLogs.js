import { useQuery } from '@tanstack/react-query'

import apiClient from '../util/apiClient'

const defaultCacheTime = 900000

const useOrganisationLogs = (code, options = {}) => {
  const queryKey = ['organisationsLogs', code]
  const queryFn = async () => {
    const { data } = await apiClient.get(`/organisations/${code}/logs`)
    return data
  }

  const { data: organisationLogs, ...rest } = useQuery({
    queryKey,
    queryFn,
    cacheTime: defaultCacheTime,
    staleTime: defaultCacheTime,
    ...options,
  })

  return { organisationLogs, ...rest }
}

export default useOrganisationLogs
