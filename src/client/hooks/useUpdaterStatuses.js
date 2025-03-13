import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useUpdaterStatuses = (jobType, options = {}) => {
  const queryKey = ['updaterStatus', jobType]
  const queryFn = async () => {
    const { data } = await apiClient.get(`/admin/updater-status${jobType ? `?jobType=${jobType}` : ''}`)
    return data
  }

  const { data: updaterStatuses, ...rest } = useQuery({
    queryKey,
    queryFn,
    ...options,
  })

  return { updaterStatuses, ...rest }
}

export default useUpdaterStatuses
