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

export const useCourseData = (targetId) => {
  const queryKey = ['courseData', targetId]

  const response = useQuery(queryKey, async () => {
    const { data } = await apiClient.get(`/feedback-targets/${targetId}`)

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

export const useCourseQuestions = (targetId) => {
  const queryKey = ['courseQuestions', targetId]

  const response = useQuery(queryKey, async () => {
    const { data } = await apiClient.get(`/courses/${targetId}/questions`)

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
