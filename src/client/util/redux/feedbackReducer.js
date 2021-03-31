import { buildAction } from '@grp-toska/apina'

export const getAllFeedbackAction = () =>
  buildAction('feedbacks', { url: '/feedbacks' })

export const getCourseFeedbackAction = (courseId) =>
  buildAction('feedbacks', { url: `/courses/${courseId}/feedbacks` })

export const getUserFeedbackAction = () =>
  buildAction('userFeedbacks', { url: '/users/feedbacks' })

export default (
  state = {
    data: [],
    userData: null,
    pending: true,
  },
  action,
) => {
  switch (action.type) {
    case 'GET_FEEDBACKS_ATTEMPT':
      return {
        ...state,
        pending: true,
      }
    case 'GET_USERFEEDBACKS_APINA_ATTEMPT':
      return {
        ...state,
        pending: true,
      }
    case 'GET_FEEDBACKS_APINA_SUCCESS':
      return {
        ...state,
        data: action.response,
        pending: false,
      }
    case 'GET_USERFEEDBACKS_APINA_SUCCESS':
      return {
        ...state,
        userData: action.response,
        pending: false,
      }
    default:
      return state
  }
}
