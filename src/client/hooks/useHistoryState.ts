import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// Define the hook's signature using generics
const useHistoryState = <T>(key: string, initialValue: T) => {
  const navigate = useNavigate()
  const location = useLocation()

  // Get the current state from the location object, or set it to an empty object if undefined
  const historyState = (location.state as Record<string, any>) ?? {}

  // Function to replace the history state
  const replaceHistoryState = (update: Record<string, any>) => {
    navigate('.', {
      replace: true,
      state: { ...historyState, ...update },
    })
  }

  // Initialize the state with the value from historyState or use the initial value
  const [state, setState] = useState<T>(historyState[key] ?? initialValue)

  // Function to update both local state and the history state
  const handleSetState = (nextState: T) => {
    setState(nextState)
    replaceHistoryState({ [key]: nextState })
  }

  return [state, handleSetState] as const
}

export default useHistoryState
