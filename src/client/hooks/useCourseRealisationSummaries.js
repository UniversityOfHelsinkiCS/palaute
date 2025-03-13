import { useQuery } from '@tanstack/react-query'

import apiClient from '../util/apiClient'

const useCourseRealisationSummaries = (courseCode, options = {}) => {
  const queryKey = ['courseRealisationSummaries', courseCode]
  const queryFn = async () => {
    const { data } = await apiClient.get(`/course-summaries/course-units/${courseCode}`)
    return data
  }

  const { data: courseRealisationSummaries, ...rest } = useQuery({
    queryKey,
    queryFn,
    ...options,
  })

  return { courseRealisationSummaries, ...rest }
}

export default useCourseRealisationSummaries
