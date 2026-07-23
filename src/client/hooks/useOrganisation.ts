import type { GetOrganisationResponse } from '@common/types/organisation'

import { useQuery } from '@tanstack/react-query'

import apiClient from '../util/apiClient'

const useOrganisation = (code: string | undefined, options = {}) => {
  const queryKey = ['organisation', code]
  const queryFn = async () => {
    const { data } = await apiClient.get<GetOrganisationResponse>(`/organisations/${code}`)
    return data
  }

  const { data: organisation, ...rest } = useQuery({
    queryKey,
    queryFn,
    enabled: Boolean(code),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options,
  })

  return { organisation, ...rest }
}

export default useOrganisation
