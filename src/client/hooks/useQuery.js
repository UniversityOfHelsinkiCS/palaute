import { useQuery as useBaseQuery } from 'react-query'

import useId from './useId'

const normalizeQueryKey = key => (Array.isArray(key) ? key : [key])

const useQuery = (queryKey, queryFn, options = {}) => {
  const { skipCache = false, ...restOptions } = options
  const id = useId()

  const normalizedQueryKey = normalizeQueryKey(queryKey)
  const key = skipCache ? [...normalizedQueryKey, id] : normalizedQueryKey

  return useBaseQuery(key, queryFn, {
    ...restOptions,
    ...(skipCache && { cacheTime: 0 }),
  })
}

export default useQuery
