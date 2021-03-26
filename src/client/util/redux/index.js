import { combineReducers } from 'redux'

import { apiReducer as api, errorReducer as errors } from '@grp-toska/apina'

export default combineReducers({
  api,
  errors,
})
