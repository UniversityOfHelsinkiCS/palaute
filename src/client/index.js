import 'intersection-observer'
import './util/resizeObserverPolyfill'

import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'

import { inProduction, basePath } from './util/common'
import { getHeaders, setHeaders } from './util/mockHeaders'
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

const ensureDevUser = () => {
  if (inProduction) return
  const headers = getHeaders()
  if (headers.uid) return

  localStorage.clear()
  setHeaders('varisleo')
}

ensureDevUser()

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
