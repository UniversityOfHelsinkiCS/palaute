import React from 'react'
import { useLocation } from 'react-router'

const useURLSearchParams = () => {
  const location = useLocation()
  const params = React.useMemo(() => new URLSearchParams(location.search), [location.search])
  return [
    params,
    React.useCallback(nextParams => {
      const nextSearch = nextParams.toString()
      window.history.replaceState({}, '', `${location.pathname}?${nextSearch}`)
    }, []),
  ] as [URLSearchParams, (nextParams: URLSearchParams) => void]
}

export default useURLSearchParams
