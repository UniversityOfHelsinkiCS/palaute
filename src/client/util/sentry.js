import * as Sentry from '@sentry/browser'
import { Integrations } from '@sentry/tracing'
import { inProduction, GIT_SHA } from '../../config'

const initializeSentry = () => {
  if (!inProduction) return

  Sentry.init({
    dsn: 'https://8877ea30aa714216b27b22c8aa395723@sentry.cs.helsinki.fi/6',
    release: GIT_SHA,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
  })

  Sentry.setUser({ email: 'Hello@x.fi' })
}

export default initializeSentry
