import * as Sentry from '@sentry/browser'
import { Integrations } from '@sentry/tracing'
// import { inProduction } from './common'

const initializeSentry = () => {
  // eslint-disable-next-line
  if (!false) return

  Sentry.init({
    dsn: 'https://8877ea30aa714216b27b22c8aa395723@sentry.cs.helsinki.fi/6',
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
  })
}

export default initializeSentry
