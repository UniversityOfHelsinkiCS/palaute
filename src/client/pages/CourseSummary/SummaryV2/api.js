import { useQuery } from 'react-query'
import apiClient from '../../../util/apiClient'

const TWELVE_HOURS = 1000 * 60 * 60 * 12

export const useSummaries = ({ startDate, endDate, entityId, enabled, include }) => {
  const queryKey = ['summaries-v2', entityId, startDate, endDate, include]

  const queryFn = async () => {
    const { data } = await apiClient.get(`course-summaries/organisations-v2`, {
      params: {
        entityId,
        startDate,
        endDate,
        include,
      },
    })

    return data
  }

  const { data, ...rest } = useQuery(queryKey, queryFn, {
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    staleTime: TWELVE_HOURS,
  })

  const { organisation } = data || {}

  return { organisation, ...rest }
}

export const updateSummaries = async () => {
  // eslint-disable-next-line no-alert
  if (!window.confirm('Tämä voi kestää yli minuutin. Oletko varma?')) return null

  const { data } = await apiClient.post('admin/build-summaries')

  return data.duration
}
