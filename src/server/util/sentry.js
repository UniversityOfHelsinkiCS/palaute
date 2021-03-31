const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing') // eslint-disable-line
// Sentry docs Note: You MUST import the package for tracing to work
const { inProduction } = require('./config')

const initializeSentry = () => {
  if (!inProduction) return

  Sentry.init({
    dsn: 'https://8877ea30aa714216b27b22c8aa395723@sentry.cs.helsinki.fi/6',
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
    ],
    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
  })
}

module.exports = initializeSentry
