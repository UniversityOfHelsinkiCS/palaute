import { useQuery } from 'react-query'
import apiClient from '../../util/apiClient'
import queryClient from '../../util/queryClient'
import { useSummaryContext } from './context'

const TWELVE_HOURS = 1000 * 60 * 60 * 12

const fetchSummaries = async ({ startDate, endDate, entityId, include, tagId }) => {
  const { data } = await apiClient.get(`course-summaries/organisations-v2`, {
    params: {
      entityId,
      startDate,
      endDate,
      include,
      tagId,
    },
  })

  return data
}

export const getCourseUnits = async ({ startDate, endDate, organisationId }) => {
  // Check RQ cache first
  const queryKey = ['summaries-v2', organisationId, startDate, endDate, 'courseUnits']
  const cachedCourseUnits = queryClient.getQueryData(queryKey)
  if (cachedCourseUnits) return cachedCourseUnits

  // If not found in cache, fetch from API
  const courseUnits = await fetchSummaries({
    startDate,
    endDate,
    entityId: organisationId,
    include: 'courseUnits',
  })

  return courseUnits
}

/**
 * Fetches a summary row for an organisation.
 * include can be 'childOrganisations' or 'courseUnits', in which case the organisation's
 * corresponding children are included in the response, allowing the row to be expanded.
 */
export const useSummaries = ({ startDate, endDate, entityId, enabled, include, tagId }) => {
  const queryKey = ['summaries-v2', entityId, startDate, endDate, include]
  if (tagId) queryKey.push(tagId)

  const queryFn = () => fetchSummaries({ startDate, endDate, entityId, include, tagId })

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
export const useTeacherSummaries = () => {
  const { dateRange, extraOrgId, extraOrgMode } = useSummaryContext()

  const { start: startDate, end: endDate } = dateRange

  const queryKey = ['summaries-v2-teacher', startDate, endDate]
  if (extraOrgId && extraOrgMode) queryKey.push({ extraOrgId, extraOrgMode })

  const queryFn = async () => {
    const { data } = await apiClient.get(`course-summaries/user-courses-v2`, {
      params: {
        startDate,
        endDate,
        extraOrgId,
        extraOrgMode,
      },
    })

    return data
  }

  const { data, ...rest } = useQuery(queryKey, queryFn, {
    enabled: true,
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
export const useOrganisationSummaries = () => {
  const { dateRange, viewingMode, extraOrgId, extraOrgMode } = useSummaryContext()
  const { start: startDate, end: endDate } = dateRange

  const queryKey = ['summaries-v2-organisations', startDate, endDate, viewingMode]
  if (extraOrgId && extraOrgMode) queryKey.push({ extraOrgId, extraOrgMode })

  const queryFn = async () => {
    const { data } = await apiClient.get(`course-summaries/user-organisations-v2`, {
      params: {
        startDate,
        endDate,
        viewingMode,
        extraOrgId,
        extraOrgMode,
      },
    })

    return data
  }

  const { data, ...rest } = useQuery(queryKey, queryFn, {
    enabled: true,
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    staleTime: TWELVE_HOURS,
  })

  const organisations = data || []

  return { organisations, ...rest }
}

export const updateSummaries = async () => {
  if (!window.confirm('Tämä voi kestää yli minuutin. Oletko varma?')) return null

  const { data } = await apiClient.post('admin/build-summaries')

  return data.duration
}
