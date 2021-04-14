import buildAction from './util'

export const submitFormAction = (data, surveyId) =>
  buildAction('feedbacks', {
    url: '/feedbacks',
    method: 'post',
    data: { data, surveyId },
  })

export const reSubmitFormAction = (data, id) =>
  buildAction('feedbacks', {
    url: `/feedbacks/${id}`,
    method: 'put',
    data: { data },
  })

export const getUserCourseFeedbackAction = (surveyId) =>
  buildAction('previous_feedback', { url: `/users/feedbacks/${surveyId}` })

export const updateFormField = (field, value) => ({
  type: 'UPDATE_FORM_FIELD',
  field,
  value,
})

export const setData = (data) => ({
  type: 'SET_DATA',
  data,
})

export const modifyForm = () => ({
  type: 'MODIFY_FORM',
})

export default (state = { data: {}, pending: true }, action) => {
  switch (action.type) {
    case 'UPDATE_FORM_FIELD':
      return {
        ...state,
        data: {
          ...state.data,
          [action.field]: action.value,
        },
      }
    case 'MODIFY_FORM':
      return {
        ...state,
        found: false,
      }
    default:
      return state
  }
}
