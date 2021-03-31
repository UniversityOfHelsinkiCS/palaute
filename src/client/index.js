import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import './assets/custom.scss'

import store from './util/store'
import { basePath } from './util/common'
import App from './components/App'
import ErrorBoundary from './components/ErrorBoundary'
import initializeSentry from './util/sentry'

initializeSentry()

render(
  <Provider store={store}>
    <BrowserRouter basename={basePath}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root'),
)
