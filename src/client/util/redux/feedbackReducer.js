import { buildAction } from '@grp-toska/apina'

export const getAllFeedbackAction = () =>
  buildAction('feedbacks', { url: '/feedbacks' })

export const getFeedbacksByUserAction = (uid) =>
  buildAction('feedbacksByUser', { url: `/feedbacks/user/${uid}` })

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
    case 'GET_FEEDBACKSBYUSER_APINA_SUCCESS':
      return {
        ...state,
        user: action.response,
      }
    default:
      return state
  }
}
