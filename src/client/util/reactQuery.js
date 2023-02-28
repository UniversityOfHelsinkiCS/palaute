import produce from 'immer'
import queryClient from './queryClient'

/**
 * Helper function for updating RQ cache in immer style
 * @param {any[]} key querykey
 * @param {(draft) => void} updater immer style updater function
 */
export const updateCache = (key, updater) => {
  queryClient.setQueryData(key, oldData => produce(oldData, draft => updater(draft)))
}
