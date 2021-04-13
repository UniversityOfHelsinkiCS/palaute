import { useQuery } from 'react-query'

import apiClient from './apiClient'

export const useFeedbackEnabledCourses = () => {
  const queryKey = 'feedbackEnabledCourses'

  const response = useQuery(queryKey, async () => {
    const { data } = await apiClient.get('/enrolments')

    return data
  })

  return response
}

export const useCourseData = (courseId) => {
  const queryKey = ['courseData', courseId]

  const response = useQuery(queryKey, async () => {
    const { data } = await apiClient.get(`/feedback-targets/${courseId}`)

    return data
  })

  return response
}

export const useCourseFeedback = (courseId) => {
  const queryKey = ['courseFeedback', courseId]

  const response = useQuery(queryKey, async () => {
    const { data } = await apiClient.get(`/courses/${courseId}/feedbacks`)

    return data
  })

  return response
}

export const useCourseQuestions = (courseId) => {
  const queryKey = ['courseQuestions', courseId]

  const response = useQuery(queryKey, async () => {
    const { data } = await apiClient.get(`/courses/${courseId}/questions`)

    return data
  })

  return response
}

export const useUserFeedback = () => {
  const queryKey = 'userFeedback'

  const response = useQuery(queryKey, async () => {
    const { data } = await apiClient.get('/users/feedbacks')

    return data
  })

  return response
}

export const useTeacherCourses = () => {
  const queryKey = 'teacherCourses'

  const response = useQuery(queryKey, async () => {
    const { data } = await apiClient.get(
      '/course-unit-realisations/responsible',
    )

    return data
  })

  return response
}

export const useUserData = () => {
  const queryKey = 'userData'

  const response = useQuery(queryKey, async () => {
    const { data } = await apiClient.get('/login')

    return data
  })

  return response
}
