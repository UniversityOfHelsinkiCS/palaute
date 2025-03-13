import { useQuery } from '@tanstack/react-query'

import apiClient from '../util/apiClient'

const useInactiveCourseRealisations = () => {
  const queryKey = 'inactiveCourseRealisations'
  const queryFn = async () => {
    const { data } = await apiClient.get('admin/inactive-course-realisations')
    return data
  }

  const { data: inactiveCourseRealisations, ...rest } = useQuery({
    queryKey: [queryKey],
    queryFn,
  })

  return { inactiveCourseRealisations, ...rest }
}

export default useInactiveCourseRealisations
