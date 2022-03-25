import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useUpdaterStatus = (options = {}) => {
  const queryKey = 'updaterStatus'

  const queryFn = async () => {
    const { data } = await apiClient.get('/admin/updater-status')

    return data
  }

  const { data: updaterStatus, ...rest } = useQuery(queryKey, queryFn, {
    ...options,
  })

  return { updaterStatus, ...rest }
}

export default useUpdaterStatus
