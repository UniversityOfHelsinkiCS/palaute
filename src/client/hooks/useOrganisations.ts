import { useQuery } from '@tanstack/react-query'
import type { UserOrganisation } from '@common/types/organisation'
import apiClient from '../util/apiClient'

const defaultCacheTime = 900000

const useOrganisations = (options = {}) => {
  const queryKey = ['organisations']
  const queryFn = async () => {
    const { data } = await apiClient.get<UserOrganisation[]>('/organisations')
    return data
  }

  const { data: organisations, ...rest } = useQuery({
    queryKey,
    queryFn,
    gcTime: defaultCacheTime,
    staleTime: defaultCacheTime,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...options,
  })

  return { organisations, ...rest }
}

export default useOrganisations
