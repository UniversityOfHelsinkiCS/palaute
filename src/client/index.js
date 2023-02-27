import 'intersection-observer'
import './util/resizeObserverPolyfill'

import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from 'react-query'

import { inProduction, basePath, DEV_USERNAME } from './util/common'
import { getHeaders, setHeaders } from './util/mockHeaders'
import App from './pages/App'
import ErrorBoundary from './components/ErrorBoundary'
import initializeSentry from './util/sentry'
import './util/i18n'
import queryClient from './util/queryClient'

initializeSentry()

const ensureDevUser = () => {
  if (inProduction) return
  const headers = getHeaders()
  if (headers.uid) return

  localStorage.clear()
  setHeaders(DEV_USERNAME)
}

ensureDevUser()

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <BrowserRouter basename={basePath}>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </QueryClientProvider>
  </BrowserRouter>
)
