import { useQuery } from '@tanstack/react-query'

import apiClient from '../util/apiClient'
import { getSafeCourseCode } from '../util/courseIdentifiers'

const defaultCacheTime = 9_000_000

const useCourseRealisationSummaries = (courseCode, options = {}) => {
  const safeCourseCode = getSafeCourseCode({ courseCode })

  const queryKey = ['courseRealisationSummaries', courseCode]
  const queryFn = async () => {
    const { data } = await apiClient.get(`/course-summaries/course-units/${safeCourseCode}`)
    return data
  }

  const { data: courseRealisationSummaries, ...rest } = useQuery({
    queryKey,
    queryFn,
    cacheTime: defaultCacheTime,
    staleTime: defaultCacheTime,
    enabled: Boolean(courseCode),
    retry: false,
    ...options,
  })

  return { courseRealisationSummaries, ...rest }
}

export default useCourseRealisationSummaries
