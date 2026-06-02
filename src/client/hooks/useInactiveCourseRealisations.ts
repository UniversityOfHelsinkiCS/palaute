import { useQuery } from '@tanstack/react-query'
import type { GetInactiveCourseRealisationsResponse } from '@common/types/admin'
import apiClient from '../util/apiClient'

const useInactiveCourseRealisations = () => {
  const queryKey = 'inactiveCourseRealisations'
  const queryFn = async () => {
    const { data } = await apiClient.get<GetInactiveCourseRealisationsResponse>('admin/inactive-course-realisations')
    return data
  }

  const { data: inactiveCourseRealisations, ...rest } = useQuery({
    queryKey: [queryKey],
    queryFn,
  })

  return { inactiveCourseRealisations, ...rest }
}

export default useInactiveCourseRealisations
