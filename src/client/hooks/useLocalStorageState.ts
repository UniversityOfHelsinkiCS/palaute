import React from 'react'

const useLocalStorageState = <T>(
  key: string,
  initialValueIfNoneStored: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const initial = React.useMemo<T>(() => {
    const str = localStorage.getItem(key)
    if (typeof str === 'string') {
      return JSON.parse(str) as T
    }
    return initialValueIfNoneStored
  }, [key])

  const [state, setState] = React.useState<T>(initial)

  React.useEffect(() => {
    if (state !== undefined) {
      localStorage.setItem(key, JSON.stringify(state))
    } else {
      localStorage.removeItem(key)
    }
  }, [key, state])

  return [state, setState]
}

export default useLocalStorageState
