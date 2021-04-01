import { combineReducers } from 'redux'

import { apiReducer as api, errorReducer as errors } from '@grp-toska/apina'
import form from './formReducer'
import error from './errorReducer'
import questions from './modifyQuestionsReducer'

export default combineReducers({
  api,
  errors,
  form,
  error,
  questions,
})
