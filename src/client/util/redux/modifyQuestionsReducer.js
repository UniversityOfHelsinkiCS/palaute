import { buildAction } from '@grp-toska/apina'

export const submitUpdates = (courseId, data) =>
  buildAction('questions', {
    url: `/courses/${courseId}/questions`,
    method: 'put',
    data: { data },
  })

export const getCourseQuestionsAction = (courseId) =>
  buildAction('questions', { url: `/courses/${courseId}/questions` })

export const toggleRequiredField = (index) => ({
  type: 'TOGGLE_REQUIRED',
  index,
})

const returnToggled = (questions, index) => {
  const newQuestions = questions
  newQuestions[index].required = !newQuestions[index].required
  return newQuestions
}

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
        pending: false,
        data: action.response.data,
      }
    case 'PUT_QUESTIONS_APINA_SUCCESS':
      return {
        ...state,
        data: {},
        pending: true,
      }
    case 'TOGGLE_REQUIRED':
      return {
        ...state,
        data: {
          questions: returnToggled(state.data.questions, action.index),
        },
      }
    default:
      return state
  }
}
