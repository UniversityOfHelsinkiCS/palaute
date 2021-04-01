const { ApplicationError } = require('../util/customErrors')
const Sentry = require('@sentry/node')
const logger = require('../util/logger')

const errorHandler = (error, req, res, next) => {
  logger.error(`${error.message} ${error.name} ${error.extra}`)

  const errorWasExpected = error instanceof ApplicationError

  if (!errorWasExpected) Sentry.captureException(error)

  const normalizedError = errorWasExpected
    ? error
    : new ApplicationError(error.message)

  res.status(normalizedError.status).json(normalizedError)

  return next(error)
}

module.exports = errorHandler
