import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const useURLSearchParams = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const params = React.useMemo(() => new URLSearchParams(location.search), [location.search])

  const setParams = React.useCallback(
    (nextParams: URLSearchParams) => {
      const nextSearch = nextParams.toString()
      navigate(`${location.pathname}?${nextSearch}`, { replace: true })
    },
    [location.pathname, navigate]
  )

  return [params, setParams] as [URLSearchParams, (nextParams: URLSearchParams) => void]
}

export default useURLSearchParams
