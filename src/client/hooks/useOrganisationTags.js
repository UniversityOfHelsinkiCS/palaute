import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'
import { TAGS_ENABLED } from '../util/common'

const useOrganisationTags = organisationCode => {
  const queryKey = ['organisationTags']

  const queryFn = async () => {
    const { data } = await apiClient.get(`/tags/${organisationCode}`)

    return data
  }

  const { data: tags, ...rest } = useQuery(queryKey, queryFn, {
    enabled: TAGS_ENABLED.includes(organisationCode),
  })

  return { tags, ...rest }
}

export default useOrganisationTags
