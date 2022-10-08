import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useUpdaterStatuses = (options = {}) => {
  const queryKey = 'updaterStatus'

  const queryFn = async () => {
    const { data } = await apiClient.get('/admin/updater-status')

    return data
  }

  const { data: updaterStatuses, ...rest } = useQuery(queryKey, queryFn, {
    ...options,
  })

  return { updaterStatuses, ...rest }
}

export default useUpdaterStatuses
