import { buildAction } from '@grp-toska/apina'

export const loginAction = () => buildAction('login', { url: '/login' })

export default (state = { user: null }, action) => {
  switch (action.type) {
    case 'GET_LOGIN_ATTEMPT':
      return {
        ...state,
        pending: true,
      }
    case 'GET_LOGIN_SUCCESS':
      return {
        ...state,
        pending: false,
        user: action.response.data,
      }
    default:
      return state
  }
}
