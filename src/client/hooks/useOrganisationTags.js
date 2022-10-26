import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const useOrganisationTags = (organisationCode) => {
  const queryKey = ['organisationTags']

  const queryFn = async () => {
    const { data } = await apiClient.get(`/tags/${organisationCode}`)

    return data
  }

  const { data: tags, ...rest } = useQuery(queryKey, queryFn, {
    enabled: organisationCode === '600-K001',
  })

  return { tags, ...rest }
}

export default useOrganisationTags
