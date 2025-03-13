import { useQuery as useBaseQuery } from '@tanstack/react-query'

import useId from './useId'

const normalizeQueryKey = key => (Array.isArray(key) ? key : [key])

const useQuery = (options = {}) => {
  const { queryKey, queryFn, skipCache = false, ...restOptions } = options
  const id = useId()

  const normalizedQueryKey = normalizeQueryKey(queryKey)
  const key = skipCache ? [...normalizedQueryKey, id] : normalizedQueryKey

  return useBaseQuery({
    queryKey: key,
    queryFn,
    ...restOptions,
    ...(skipCache && { cacheTime: 0 }),
  })
}

export default useQuery
