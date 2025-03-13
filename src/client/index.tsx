import 'intersection-observer'
import './util/resizeObserverPolyfill'

import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'

import { inProduction, basePath, DEV_USERNAME } from './util/common'
import { getHeaders, setHeaders } from './util/mockHeaders'
import initializeSentry from './util/sentry'
import queryClient from './util/queryClient'
import './util/i18n'

import App from './pages/App'
import ErrorBoundary from './components/ErrorBoundary'

initializeSentry()

const ensureDevUser = () => {
  if (inProduction) return
  const headers = getHeaders()
  if (headers.uid) return

  localStorage.clear()
  setHeaders(DEV_USERNAME)
}

ensureDevUser()

const container: HTMLElement | null = document.getElementById('root')

if (!container) {
  throw new Error('Root container is missing.')
}

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
