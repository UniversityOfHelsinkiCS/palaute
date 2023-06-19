const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing') // eslint-disable-line
// Sentry docs Note: You MUST import the package for tracing to work
const { inProduction, inStaging, GIT_SHA, SENTRY_DSN } = require('./config')

const initializeSentry = router => {
  if (!inProduction || inStaging) return

  Sentry.init({
    dsn: SENTRY_DSN,
    release: GIT_SHA,
    integrations: [new Sentry.Integrations.Http({ tracing: true }), new Tracing.Integrations.Express({ router })],
    tracesSampleRate: 1.0,
  })
}

module.exports = initializeSentry
