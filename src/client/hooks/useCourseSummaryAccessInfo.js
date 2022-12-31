import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useCourseSummaryAccessInfo = (options = {}) => {
  const queryKey = 'courseSummaryAccessInfo'

  const queryFn = async () => {
    const { data } = await apiClient.get(`/course-summaries/access`)

    return data
  }

  const { data: courseSummaryAccessInfo, ...rest } = useQuery(queryKey, queryFn, options)

  return { courseSummaryAccessInfo, ...rest }
}

export default useCourseSummaryAccessInfo
