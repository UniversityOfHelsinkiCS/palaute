import { format, subDays } from 'date-fns'
import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

// Filters live in the URL, so a link or a reload opens the same view

export const today = () => format(new Date(), 'yyyy-MM-dd')

export const daysAgo = (days: number) => format(subDays(new Date(), days), 'yyyy-MM-dd')

// A value of undefined removes the parameter; '' is kept, as it means something for version
export type UrlFilterUpdate = Record<string, string | undefined>

const useUrlFilters = () => {
  const [params, setParams] = useSearchParams()

  // An empty search parameter is ''
  const get = (name: string) => params.get(name) ?? undefined

  // Typing in a filter replaces the history entry; opening something adds one, so Back returns from it
  const set = useCallback(
    (update: UrlFilterUpdate, { push = false } = {}) =>
      setParams(
        current => {
          const next = new URLSearchParams(current)
          Object.entries(update).forEach(([name, value]) => {
            if (value === undefined) next.delete(name)
            else next.set(name, value)
          })
          return next
        },
        { replace: !push }
      ),
    [setParams]
  )

  return { get, set }
}

export default useUrlFilters
