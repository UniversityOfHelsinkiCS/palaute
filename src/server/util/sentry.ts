import * as Sentry from '@sentry/node'

import { inProduction, inE2EMode, GIT_SHA, SENTRY_DSN } from './config'

export const initializeSentry = () => {
  if (!inProduction || inE2EMode) return

  Sentry.init({
    dsn: SENTRY_DSN,
    release: GIT_SHA,
    integrations: [Sentry.httpIntegration({ breadcrumbs: true }), Sentry.expressIntegration()],
    tracesSampleRate: 1.0,
    ignoreErrors: ['No access', 'jwt expired', 'Not found'],
  })
}
