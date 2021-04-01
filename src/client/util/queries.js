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

export const useCourseData = (courseId) => {
  const queryKey = 'courseData'

  const response = useQuery(queryKey, async () => {
    const { data } = await getAxios.get(`/course-unit-realisations/${courseId}`)

    return data
  })

  return response
}

export const useCourseFeedback = (courseId) => {
  const queryKey = 'courseFeedback'

  const response = useQuery(queryKey, async () => {
    const { data } = await getAxios.get(`/courses/${courseId}/feedbacks`)

    return data
  })

  return response
}

export const useCourseQuestions = (courseId) => {
  const queryKey = 'courseQuestions'

  const response = useQuery(queryKey, async () => {
    const { data } = await getAxios.get(`/courses/${courseId}/questions`)

    return data
  })

  return response
}

export const useUserFeedback = () => {
  const queryKey = 'userFeedback'

  const response = useQuery(queryKey, async () => {
    const { data } = await getAxios.get('/users/feedbacks')

    return data
  })

  return response
}
