import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useChangedClosingDates = (options = {}) => {
  const queryKey = 'closingDates'

  const queryFn = async () => {
    const { data } = await apiClient.get('/admin/changed-closing-dates')

    return data
  }

  const { data: feedbackTargets, ...rest } = useQuery(queryKey, queryFn, {
    ...options,
  })

  return { feedbackTargets, ...rest }
}

export default useChangedClosingDates
