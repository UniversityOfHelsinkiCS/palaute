const { ApplicationError } = require('../util/customErrors')
const logger = require('../util/logger')

const errorHandler = (error, req, res, next) => {
  logger.error(`${error.message} ${error.name} ${error.stack}`)
  if (res.headersSent) {
    return next(error)
  }

  const normalizedError =
    error instanceof ApplicationError
      ? error
      : new ApplicationError(error.message)

  res.status(normalizedError.status).json(normalizedError)
}

module.exports = errorHandler
