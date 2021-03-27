import { combineReducers } from 'redux'

import { apiReducer as api, errorReducer as errors } from '@grp-toska/apina'
import form from './formReducer'
import feedback from './feedbackReducer'

export default combineReducers({
  api,
  errors,
  form,
  feedback,
})
