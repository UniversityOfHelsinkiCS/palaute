import { useQuery } from '@tanstack/react-query'

import apiClient from '../util/apiClient'

const defaultCacheTime = 900000

const useOrganisationData = (options = {}) => {
  const queryKey = ['organisation-data']
  const queryFn = async () => {
    const { data } = await apiClient.get(`/organisations/data`)
    return data
  }

  const { data, ...rest } = useQuery({
    queryKey,
    queryFn,
    cacheTime: defaultCacheTime,
    staleTime: defaultCacheTime,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...options,
  })

  return { data, ...rest }
}

export default useOrganisationData
