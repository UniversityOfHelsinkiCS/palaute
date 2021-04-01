import { useQuery } from 'react-query'
import { getAxios } from './apiConnection'

export const useFeedbackEnabledCourses = () => {
  const queryKey = 'feedbackEnabledCourses'

  const response = useQuery(queryKey, async () => {
    const { data } = await getAxios.get(
      '/course-unit-realisations/feedback-enabled',
    )

    return data
  })

  return response
}

export const x = () => true
