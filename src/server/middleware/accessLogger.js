const morgan = require('morgan')
const { inProduction } = require('../util/config')
const logger = require('../util/logger')

const accessLogger = morgan((tokens, req, res) => {
  const { uid } = req.headers

  const method = tokens.method(req, res)
  const url = tokens.url(req, res)
  const status = tokens.status(req, res)
  const responseTime = tokens['response-time'](req, res)
  const userAgent = tokens['user-agent'](req, res)

  const message = `${method} ${url} ${status} - ${responseTime} ms`

  const additionalInfo = inProduction
    ? {
        userId: uid,
        method,
        url,
        status,
        responseTime,
        userAgent,
      }
    : {}

  logger.info(message, additionalInfo)
})

module.exports = accessLogger
