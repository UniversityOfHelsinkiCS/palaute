import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from 'react-query'
import './assets/custom.scss'

import store from './util/store'
import { basePath } from './util/common'
import App from './components/App'
import ErrorBoundary from './components/ErrorBoundary'
import initializeSentry from './util/sentry'
import initializeI18n from './util/i18n'

initializeSentry()
initializeI18n()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

render(
  <Provider store={store}>
    <BrowserRouter basename={basePath}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </QueryClientProvider>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root'),
)
