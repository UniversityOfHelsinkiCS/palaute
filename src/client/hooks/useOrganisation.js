import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useOrganisation = (code, options = {}) => {
  const queryKey = ['organisation', code]

  const queryFn = async () => {
    const { data } = await apiClient.get(`/organisations/${code}`)

    return data
  }

  const { data: organisation, ...rest } = useQuery(queryKey, queryFn, {
    enabled: Boolean(code),
    ...options,
  })

  return { organisation, ...rest }
}

export default useOrganisation
