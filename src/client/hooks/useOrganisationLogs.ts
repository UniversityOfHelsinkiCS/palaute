import { useQuery } from '@tanstack/react-query'
import type { GetOrganisationLogsResponse } from '@common/types/organisation'
import apiClient from '../util/apiClient'

const defaultCacheTime = 900000

const useOrganisationLogs = (code: string | undefined, options = {}) => {
  const queryKey = ['organisationsLogs', code]
  const queryFn = async () => {
    const { data } = await apiClient.get<GetOrganisationLogsResponse>(`/organisations/${code}/logs`)
    return data
  }

  const { data: organisationLogs, ...rest } = useQuery({
    queryKey,
    queryFn,
    gcTime: defaultCacheTime,
    staleTime: defaultCacheTime,
    ...options,
  })

  return { organisationLogs, ...rest }
}

export default useOrganisationLogs
