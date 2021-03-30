import { buildAction } from '@grp-toska/apina'

export const submitFormAction = (data) =>
  buildAction('feedbacks', {
    url: '/feedbacks',
    method: 'post',
    data: { data },
  })

export const reSubmitFormAction = (data, id) =>
  buildAction('feedbacks', {
    url: `/feedbacks/${id}`,
    method: 'put',
    data: { data },
  })

export const getPreviousFeedback = () =>
  buildAction('previous_feedback', { url: '/feedbacks/user/' })

export const updateFormField = (field, value) => ({
  type: 'UPDATE_FORM_FIELD',
  field,
  value,
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
    case 'POST_FEEDBACKS_APINA_SUCCESS':
      return {
        ...state,
        data: {},
      }
    case 'PUT_FEEDBACKS_APINA_SUCCESS':
      return {
        ...state,
        data: {},
        feedbackId: null,
        found: null,
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
        feedbackId: action.response.id,
      }
    // Fail is ok, that means there was no previous feedback
    case 'GET_PREVIOUS_FEEDBACK_APINA_FAILURE':
      return {
        ...state,
        pending: false,
        found: false,
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
