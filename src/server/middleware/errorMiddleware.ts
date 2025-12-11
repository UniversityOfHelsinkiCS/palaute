import * as Sentry from '@sentry/node'
import { NextFunction, Request, Response } from 'express'
import { ApplicationError } from '../util/ApplicationError'
import { logger } from '../util/logger'

export const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${error.message} ${error.name} ${error.stack}`)

  Sentry.captureException(error)

  if (res.headersSent) {
    next(error)
    return
  }

  const normalizedError = error instanceof ApplicationError ? error : new ApplicationError(error.message)

  res.status(normalizedError.status).json(normalizedError)
}
