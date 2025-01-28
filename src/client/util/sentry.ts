import * as Sentry from '@sentry/browser'
import { inProduction, inE2EMode, GIT_SHA, SENTRY_DSN } from './common'

const initializeSentry = () => {
  if (!inProduction || inE2EMode) return

  Sentry.init({
    dsn: SENTRY_DSN,
    release: GIT_SHA,
    integrations: [
      Sentry.breadcrumbsIntegration(),
      Sentry.browserTracingIntegration(),
      Sentry.thirdPartyErrorFilterIntegration({
        filterKeys: ['norppa-course-feedback'],
        behaviour: 'drop-error-if-contains-third-party-frames',
      }),
    ],
    tracesSampleRate: 1.0,
  })
}

export default initializeSentry
