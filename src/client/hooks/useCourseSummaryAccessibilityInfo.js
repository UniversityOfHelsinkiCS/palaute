import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useCourseSummaryAccessibilityInfo = () => {
  const queryKey = 'courseSummary'

  const queryFn = async () => {
    const { data } = await apiClient.get(`/course-summaries/accessible`)

    return data
  }

  const { data: accessibilityInfo, ...rest } = useQuery(queryKey, queryFn)

  return { accessibilityInfo, ...rest }
}

export default useCourseSummaryAccessibilityInfo
