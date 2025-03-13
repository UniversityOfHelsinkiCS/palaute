import { useQuery } from '@tanstack/react-query'

import apiClient from '../util/apiClient'

const defaultCacheTime = 900000

const useOrganisations = (options = {}) => {
  const queryKey = ['organisations']
  const queryFn = async () => {
    const { data } = await apiClient.get(`/organisations`)
    return data
  }

  const { data: organisations, ...rest } = useQuery({
    queryKey,
    queryFn,
    cacheTime: defaultCacheTime,
    staleTime: defaultCacheTime,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...options,
  })

  return { organisations, ...rest }
}

export default useOrganisations
