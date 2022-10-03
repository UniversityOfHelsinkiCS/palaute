import React from 'react'

const useLocalStorageState = (key) => {
  const initial = React.useMemo(() => {
    const str = localStorage.getItem(key)
    if (typeof str === 'string') {
      return JSON.parse(str)
    }
    return null
  }, [key])

  const [state, setState] = React.useState(initial)

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [state])

  return [state, setState]
}

export default useLocalStorageState
