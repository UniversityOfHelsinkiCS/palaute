import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../util/apiClient'
import { useSummaryContext } from './context'
import { getSafeCourseCode } from '../../util/courseIdentifiers'

const TWELVE_HOURS = 1000 * 60 * 60 * 12

const fetchSummaries = async ({ startDate, endDate, entityId, include, tagId, extraOrgId, extraOrgMode }) => {
  const { data } = await apiClient.get(`course-summaries/organisations-v2`, {
    params: {
      entityId,
      startDate,
      endDate,
      include,
      tagId,
      extraOrgId,
      extraOrgMode,
    },
  })

  return data
}

/**
 * Fetches a summary row for an organisation.
 * include can be 'childOrganisations' or 'courseUnits', in which case the organisation's
 * corresponding children are included in the response, allowing the row to be expanded.
 */
export const useSummaries = ({ entityId, enabled, include, tagId }) => {
  const { dateRange, extraOrgId, extraOrgMode } = useSummaryContext()
  const { start: startDate, end: endDate } = dateRange

  const queryKey = ['summaries-v2', entityId, startDate, endDate, include]
  if (tagId) queryKey.push(tagId)
  if (extraOrgId && extraOrgMode) queryKey.push({ extraOrgId, extraOrgMode })

  const queryFn = () => fetchSummaries({ startDate, endDate, entityId, include, tagId, extraOrgId, extraOrgMode })

  const { data, ...rest } = useQuery({
    queryKey,
    queryFn,
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

  const { data, ...rest } = useQuery({
    queryKey,
    queryFn,
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
  const { dateRange, extraOrgId, extraOrgMode } = useSummaryContext()
  const { start: startDate, end: endDate } = dateRange

  const queryKey = ['summaries-v2-organisations', startDate, endDate]
  if (extraOrgId && extraOrgMode) queryKey.push({ extraOrgId, extraOrgMode })

  const queryFn = async () => {
    const { data } = await apiClient.get(`course-summaries/user-organisations-v2`, {
      params: {
        startDate,
        endDate,
        extraOrgId,
        extraOrgMode,
      },
    })

    return data
  }

  const { data, ...rest } = useQuery({
    queryKey,
    queryFn,
    enabled: true,
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    staleTime: TWELVE_HOURS,
  })

  const organisations = data || []

  return { organisations, ...rest }
}

export const useCourseUnitGroupSummaries = ({ courseCode, startDate, endDate, allTime }) => {
  const safeCourseCode = getSafeCourseCode({ courseCode })

  const queryKey = allTime
    ? ['summaries-course-unit-group', courseCode, 'all']
    : ['summaries-course-unit-group', courseCode, startDate, endDate]

  const queryFn = async () => {
    const { data } = await apiClient.get(`course-summaries/course-unit-group`, {
      params: {
        courseCode: safeCourseCode,
        startDate,
        endDate,
        allTime,
      },
    })

    return data
  }

  const { data, ...rest } = useQuery({
    queryKey,
    queryFn,
    enabled: true,
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    staleTime: TWELVE_HOURS,
  })

  return { courseUnitGroup: data, ...rest }
}

const PINNED_ORGANISATIONS_KEY = ['pinned-organisations']

export const usePinnedOrganisations = () => {
  const { data, ...rest } = useQuery({
    queryKey: PINNED_ORGANISATIONS_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get('users/me/pinned-organisations')
      return data
    },
    staleTime: TWELVE_HOURS,
    retry: false,
    refetchOnWindowFocus: false,
  })

  return { pinnedOrganisations: data ?? [], ...rest }
}

export const usePinOrganisationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }) => apiClient.post('users/me/pinned-organisations', { organisationId: id }),
    onMutate: async pinnedOrg => {
      await queryClient.cancelQueries({ queryKey: PINNED_ORGANISATIONS_KEY })
      const previous = queryClient.getQueryData(PINNED_ORGANISATIONS_KEY) ?? []
      if (!previous.some(p => p.id === pinnedOrg.id)) {
        queryClient.setQueryData(PINNED_ORGANISATIONS_KEY, [...previous, pinnedOrg])
      }
      return { previous }
    },
    onError: (_err, _pinnedOrg, context) => {
      if (context?.previous) queryClient.setQueryData(PINNED_ORGANISATIONS_KEY, context.previous)
    },
    onSettled: (_data, error) => {
      if (error) queryClient.invalidateQueries({ queryKey: PINNED_ORGANISATIONS_KEY })
    },
  })
}

export const useUnpinOrganisationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: organisationId => apiClient.delete(`users/me/pinned-organisations/${organisationId}`),
    onMutate: async organisationId => {
      await queryClient.cancelQueries({ queryKey: PINNED_ORGANISATIONS_KEY })
      const previous = queryClient.getQueryData(PINNED_ORGANISATIONS_KEY) ?? []
      queryClient.setQueryData(
        PINNED_ORGANISATIONS_KEY,
        previous.filter(p => p.id !== organisationId)
      )
      return { previous }
    },
    onError: (_err, _organisationId, context) => {
      if (context?.previous) queryClient.setQueryData(PINNED_ORGANISATIONS_KEY, context.previous)
    },
    onSettled: (_data, error) => {
      if (error) queryClient.invalidateQueries({ queryKey: PINNED_ORGANISATIONS_KEY })
    },
  })
}

export const updateSummaries = async ({ forceAll }) => {
  if (!window.confirm('Tämä voi kestää yli minuutin. Oletko varma?')) return null

  const { data } = await apiClient.post('admin/build-summaries', { forceAll })

  return data.duration
}
