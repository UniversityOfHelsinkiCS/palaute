import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import 'react-virtualized/styles.css'
import './assets/custom.scss'

import store from './util/store'
import { basePath } from './util/common'
import App from './components/App'
import ErrorBoundary from './components/ErrorBoundary'
import * as serviceWorker from './serviceWorker'

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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
