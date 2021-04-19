import { useQuery } from 'react-query'

import apiClient from './apiClient'

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
    const { data } = await apiClient.get('/course-units/responsible')

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
