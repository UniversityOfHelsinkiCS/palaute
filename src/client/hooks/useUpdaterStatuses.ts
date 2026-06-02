import type { UpdaterStatus } from '@common/types/admin'
import apiClient from '../util/apiClient'
import useQuery from './useQuery'

const useUpdaterStatuses = (jobType?: string, options = {}) => {
  const queryKey = ['updaterStatus', jobType]
  const queryFn = async () => {
    const { data } = await apiClient.get<UpdaterStatus[]>(
      `/admin/updater-status${jobType ? `?jobType=${jobType}` : ''}`
    )
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
