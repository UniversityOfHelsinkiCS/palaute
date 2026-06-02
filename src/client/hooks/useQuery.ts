import { useQuery as useBaseQuery, UseQueryOptions, UseQueryResult, QueryKey } from '@tanstack/react-query'
import useId from './useId'

type CustomQueryOptions<TData> = Omit<UseQueryOptions<TData>, 'queryKey'> & {
  queryKey: QueryKey | string
  skipCache?: boolean
}

const normalizeQueryKey = (key: QueryKey | string): QueryKey => (Array.isArray(key) ? key : [key])

const useQuery = <TData = unknown>(options: CustomQueryOptions<TData>): UseQueryResult<TData> => {
  const { queryKey, queryFn, skipCache = false, ...restOptions } = options
  const id = useId()

  const normalizedQueryKey = normalizeQueryKey(queryKey)
  const key = skipCache ? [...normalizedQueryKey, id] : normalizedQueryKey

  return useBaseQuery({
    queryKey: key,
    queryFn,
    ...restOptions,
    ...(skipCache && { gcTime: 0 }),
  })
}

export default useQuery
