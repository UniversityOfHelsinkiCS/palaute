import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const defaultCacheTime = 900000

const useCourseRealisationSummaries = (courseUnitId, options = {}) => {
  const queryKey = ['courseRealisationSummaries', courseUnitId]

  const queryFn = async () => {
    const { data } = await apiClient.get(
      `/course-summaries/course-units/${courseUnitId}`,
    )

    return data
  }

  const { data: courseRealisationSummaries, ...rest } = useQuery(
    queryKey,
    queryFn,
    {
      cacheTime: defaultCacheTime,
      staleTime: defaultCacheTime,
      enabled: Boolean(courseUnitId),
      ...options,
    },
  )

  return { courseRealisationSummaries, ...rest }
}

export default useCourseRealisationSummaries
