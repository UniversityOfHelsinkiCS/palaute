import { useQuery } from 'react-query'

import apiClient from '../../util/apiClient'

const defaultCacheTime = 900000

// eslint-disable-next-line import/no-unused-modules
export const useMyTeachingTabCounts = (params, options = {}) => {
  const queryFn = async () => {
    const { data } = await apiClient.get('/my-teaching/tab-counts', { params })

    return data
  }

  const { data: tabCounts, ...rest } = useQuery('myTeachingTabCounts', queryFn, {
    cacheTime: defaultCacheTime,
    staleTime: defaultCacheTime,
    ...options,
  })

  return { tabCounts, ...rest }
}
