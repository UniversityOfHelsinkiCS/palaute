import { useQuery } from 'react-query'
import apiClient from '../util/apiClient'

const useOrganisationsList = () => {
  const queryFn = async () => {
    const { data: organisations } = await apiClient.get('/organisations/list')
    return organisations
  }

  const { data, ...rest } = useQuery('organisations-list', queryFn, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  return { organisationsList: data, ...rest }
}

export default useOrganisationsList
