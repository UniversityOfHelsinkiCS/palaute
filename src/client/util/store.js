import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { getMiddleware as simpleApi } from '@grp-toska/apina'
import combinedReducers from './redux'
import { getHeaders } from './mockHeaders'
import { basePath } from './common'

// eslint-disable-next-line
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(
  combinedReducers,
  composeEnhancers(
    applyMiddleware(
      thunk,
      simpleApi({ baseURL: `${basePath}/api`, headers: getHeaders() }),
    ),
  ),
)

export default store
