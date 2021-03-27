import { buildAction } from '@grp-toska/apina'

export const submitFormAction = (data) =>
  buildAction('form', { url: '/form', method: 'post', data })

export const updateFormField = (field, value) => ({
  type: 'UPDATE_FORM_FIELD',
  field,
  value,
})

export default (state = [], action) => {
  switch (action.type) {
    case 'UPDATE_FORM_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      }
    default:
      return state
  }
}
