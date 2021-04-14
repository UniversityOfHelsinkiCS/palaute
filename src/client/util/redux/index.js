import { combineReducers } from 'redux'
import form from './formReducer'
import error from './errorReducer'
import questions from './modifyQuestionsReducer'

export default combineReducers({
  form,
  error,
  questions,
})
