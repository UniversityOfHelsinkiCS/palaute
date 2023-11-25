import { useQuery } from 'react-query'
import apiClient from '../../../util/apiClient'

const TWELVE_HOURS = 1000 * 60 * 60 * 12

/**
 * Fetches a summary row for an organisation.
 * include can be 'childOrganisations' or 'courseUnits', in which case the organisation's
 * corresponding children are included in the response, allowing the row to be expanded.
 */
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

/**
 * Fetches all summaries for a teacher based on their courses.
 * Returns a list of organisations with course units as children.
 */
export const useTeacherSummaries = ({ startDate, endDate, enabled }) => {
  const queryKey = ['summaries-v2-teacher', startDate, endDate]

  const queryFn = async () => {
    const { data } = await apiClient.get(`course-summaries/user-courses-v2`, {
      params: {
        startDate,
        endDate,
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

  const organisations = data || []

  return { organisations, ...rest }
}

/**
 * Fetches all organisation rows for user based on their org access
 */
export const useOrganisationSummaries = ({ startDate, endDate, viewingMode, enabled }) => {
  const queryKey = ['summaries-v2-organisations', startDate, endDate, viewingMode]

  const queryFn = async () => {
    const { data } = await apiClient.get(`course-summaries/user-organisations-v2`, {
      params: {
        startDate,
        endDate,
        viewingMode,
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

  const organisations = data || []

  return { organisations, ...rest }
}

export const updateSummaries = async () => {
  // eslint-disable-next-line no-alert
  if (!window.confirm('Tämä voi kestää yli minuutin. Oletko varma?')) return null

  const { data } = await apiClient.post('admin/build-summaries')

  return data.duration
}
