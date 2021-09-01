const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing') // eslint-disable-line
// Sentry docs Note: You MUST import the package for tracing to work
const { inProduction, inStaging, GIT_SHA } = require('./config')

const initializeSentry = (router) => {
  if (!inProduction || inStaging) return

  Sentry.init({
    dsn: 'https://8877ea30aa714216b27b22c8aa395723@sentry.cs.helsinki.fi/6',
    release: GIT_SHA,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ router }),
    ],
    tracesSampleRate: 1.0,
  })
}

module.exports = initializeSentry
