import { useQuery } from 'react-query'

import apiClient from '../util/apiClient'

const defaultCacheTime = 900000

const useCourseRealisationSummaries = (courseCode, options = {}) => {
  const queryKey = ['courseRealisationSummaries', courseCode]

  const queryFn = async () => {
    const { data } = await apiClient.get(
      `/course-summaries/course-units/${courseCode}`,
    )

    return data
  }

  const { data: courseRealisationSummaries, ...rest } = useQuery(
    queryKey,
    queryFn,
    {
      cacheTime: defaultCacheTime,
      staleTime: defaultCacheTime,
      enabled: Boolean(courseCode),
      ...options,
    },
  )

  return { courseRealisationSummaries, ...rest }
}

export default useCourseRealisationSummaries
