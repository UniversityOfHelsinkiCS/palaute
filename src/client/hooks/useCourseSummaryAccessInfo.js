import { useQuery } from 'react-query'
import apiClient from '../util/apiClient'

const useCourseSummaryAccessInfo = (options = {}) => {
  const queryKey = 'courseSummaryAccessInfo'

  const queryFn = async () => {
    const { data } = await apiClient.get(`/course-summaries/access`)

    return data
  }

  const { data: courseSummaryAccessInfo, ...rest } = useQuery(queryKey, queryFn, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...options,
  })

  return { courseSummaryAccessInfo, ...rest }
}

export default useCourseSummaryAccessInfo
