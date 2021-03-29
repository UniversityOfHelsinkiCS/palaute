import { buildAction } from '@grp-toska/apina'

export const submitFormAction = (data) =>
  buildAction('feedbacks', {
    url: '/feedbacks',
    method: 'post',
    data: { data },
  })

export const getPreviousFeedback = (uid) =>
  buildAction('previous_feedback', { url: `/feedbacks/user/${uid}` })

export const updateFormField = (field, value) => ({
  type: 'UPDATE_FORM_FIELD',
  field,
  value,
})

export default (state = { data: {} }, action) => {
  switch (action.type) {
    case 'UPDATE_FORM_FIELD':
      return {
        ...state,
        data: {
          ...state.data,
          [action.field]: action.value,
        },
      }
    case 'POST_FEEDBACKS_APINA_SUCCESS':
      return {
        ...state,
        data: {},
      }
    case 'GET_PREVIOUS_FEEDBACK_APINA_ATTEMPT':
      return {
        ...state,
        pending: true,
      }
    case 'GET_PREVIOUS_FEEDBACK_APINA_SUCCESS':
      return {
        ...state,
        pending: false,
        found: true,
        data: action.response.data,
      }
    // Fail is ok, that means there was no previous feedback
    case 'GET_PREVIOUS_FEEDBACK_APINA_FAILURE':
      return {
        ...state,
        pending: false,
        found: false,
      }
    default:
      return state
  }
}
