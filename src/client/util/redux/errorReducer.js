let timer = null

export const clearAllErrors = () => ({
  type: 'CLEAR_ALL_ERROR',
})

export const clearError = (field) => ({
  type: 'CLEAR_ERROR',
  field,
})

export const setError = (field) => async (dispatch) => {
  dispatch({
    type: 'SET_ERROR',
    field,
  })
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => {
    dispatch(clearAllErrors())
  }, 5000)
}

export default (state = [], action) => {
  switch (action.type) {
    case 'SET_ERROR':
      return {
        ...state,
        [action.field]: true,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        [action.field]: false,
      }
    case 'CLEAR_ALL_ERROR':
      return []
    default:
      return state
  }
}
