import morgan from 'morgan'
import { Request } from 'express'
import { inProduction } from '../util/config'
import { logger } from '../util/logger'

export const accessLogger = morgan((tokens, req: Request, res) => {
  const { uid } = req.headers

  const method = tokens.method(req, res)
  const url = tokens.url(req, res)
  const requestRoute = req.route?.path
  const status = tokens.status(req, res)
  const responseTime = tokens['response-time'](req, res)
  const userAgent = tokens['user-agent'](req, res)

  const message = `${method} ${url} ${status} - ${responseTime} ms`

  const additionalInfo = inProduction
    ? {
        userId: uid,
        method,
        url,
        requestRoute,
        status,
        responseTime,
        userAgent,
      }
    : {}

  logger.info(message, additionalInfo)

  return undefined
})
