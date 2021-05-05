import 'intersection-observer'

import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'

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
  <BrowserRouter basename={basePath}>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </QueryClientProvider>
  </BrowserRouter>,
  document.getElementById('root'),
)
