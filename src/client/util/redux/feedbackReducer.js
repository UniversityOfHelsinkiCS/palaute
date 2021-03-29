import { buildAction } from '@grp-toska/apina'

export const getAllFeedbackAction = () =>
  buildAction('feedbacks', { url: '/feedbacks' })

export default (state = { data: [] }, action) => {
  switch (action.type) {
    case 'GET_FEEDBACKS_ATTEMPT':
      return {
        ...state,
        pending: true,
        error: false,
      }
    case 'GET_FEEDBACKS_APINA_SUCCESS':
      return {
        ...state,
        data: action.response,
      }
    default:
      return state
  }
}
