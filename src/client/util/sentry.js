import * as Sentry from '@sentry/browser'
import { inProduction, GIT_SHA, inE2EMode, SENTRY_DSN } from './common'

const initializeSentry = () => {
  if (!inProduction || inE2EMode) return

  Sentry.init({
    dsn: SENTRY_DSN,
    release: GIT_SHA,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
  })
}

export default initializeSentry
