const Sentry = require('@sentry/node')
const { ApplicationError } = require('../util/customErrors')
const logger = require('../util/logger')

const errorHandler = (error, req, res, next) => {
  logger.error(`${error.message} ${error.name} ${error.stack}`)

  Sentry.captureException(error)

  if (res.headersSent) {
    return next(error)
  }

  const normalizedError =
    error instanceof ApplicationError
      ? error
      : new ApplicationError(error.message)

  return res.status(normalizedError.status).json(normalizedError)
}

module.exports = errorHandler
