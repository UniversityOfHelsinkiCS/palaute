import { useState } from 'react'
import { useHistory } from 'react-router'

const useHistoryState = (key, initialValue) => {
  const history = useHistory()

  const historyState = history.location.state ?? {}

  const replaceHistoryState = (update) => {
    history.replace({
      state: { ...historyState, ...update },
    })
  }

  const [state, setState] = useState(historyState[key] ?? initialValue)

  const handleSetState = (nextState) => {
    setState(nextState)
    replaceHistoryState({ [key]: nextState })
  }

  return [state, handleSetState]
}

export default useHistoryState
