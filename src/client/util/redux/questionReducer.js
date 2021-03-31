import { buildAction } from '@grp-toska/apina'

export const getCourseQuestionsAction = (courseId) =>
  buildAction('questions', { url: `/courses/${courseId}/questions` })

export default (state = { data: {}, pending: true }, action) => {
  switch (action.type) {
    case 'GET_QUESTIONS_APINA_ATTEMPT':
      return {
        ...state,
        pending: true,
      }
    case 'GET_QUESTIONS_APINA_SUCCESS':
      return {
        ...state,
        data: action.response.data,
        pending: false,
      }
    default:
      return state
  }
}
