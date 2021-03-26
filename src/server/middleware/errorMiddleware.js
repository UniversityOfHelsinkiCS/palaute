const { ApplicationError } = require('../util/customErrors')
const logger = require('../util/logger')

const errorHandler = (error, req, res, next) => {
  logger.error(`${error.message} ${error.name} ${error.extra}`)

  const normalizedError =
    error instanceof ApplicationError
      ? error
      : new ApplicationError(error.message)

  res.status(normalizedError.status).json(normalizedError)

  return next(error)
}

module.exports = errorHandler
