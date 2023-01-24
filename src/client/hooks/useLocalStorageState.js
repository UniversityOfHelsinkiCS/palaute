import React from 'react'

const useLocalStorageState = (key, initialValueIfNoneStored) => {
  const initial = React.useMemo(() => {
    const str = localStorage.getItem(key)
    if (typeof str === 'string') {
      return JSON.parse(str)
    }
    return initialValueIfNoneStored
  }, [key])

  const [state, setState] = React.useState(initial)

  React.useEffect(() => {
    if (Boolean(state) && state === false) {
      localStorage.setItem(key, JSON.stringify(state))
    }
  }, [state])

  return [state, setState]
}

export default useLocalStorageState
