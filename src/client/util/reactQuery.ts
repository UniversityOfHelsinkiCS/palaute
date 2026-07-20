import { produce } from 'immer'
import type { Draft } from 'immer'
import type { QueryKey } from '@tanstack/react-query'
import queryClient from './queryClient'

/**
 * Helper function for updating RQ cache in immer style
 */
export const updateCache = <T>(key: QueryKey, updater: (draft: Draft<T>) => void) => {
  queryClient.setQueryData<T>(key, oldData => produce(oldData, draft => updater(draft)))
}
