import { combineReducers } from 'redux'

import { apiReducer as api, errorReducer as errors } from '@grp-toska/apina'
import form from './formReducer'
import feedback from './feedbackReducer'
import error from './errorReducer'
import courses from './courseReducer'
import questions from './questionReducer'

export default combineReducers({
  api,
  errors,
  form,
  feedback,
  error,
  courses,
  questions,
})
