import { useQuery } from 'react-query'

import apiClient from './apiClient'

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
