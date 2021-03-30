import { buildAction } from '@grp-toska/apina'

export const getCoursesAction = () =>
  buildAction('courses', { url: '/course-unit-realisations/feedback-enabled' })

export default (state = { data: {}, pending: true }, action) => {
  switch (action.type) {
    case 'GET_COURSES_APINA_ATTEMPT':
      return {
        ...state,
        pending: true,
      }
    case 'GET_COURSES_APINA_SUCCESS':
      return {
        ...state,
        data: action.response,
        pending: false,
      }
    default:
      return state
  }
}
