const winston = require('winston')
const { inProduction } = require('./config')

const { combine, timestamp, printf, splat } = winston.format

const transports = []

if (process.env.NODE_ENV !== 'test') {
  transports.push(new winston.transports.File({ filename: 'debug.log' }))
}

if (!inProduction) {
  const devFormat = printf(
    ({ level, message, timestamp, ...rest }) =>
      `${timestamp} ${level}: ${message} ${JSON.stringify(rest)}`,
  )

  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: combine(splat(), timestamp(), devFormat),
    }),
  )
}

if (inProduction) {
  const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  }

  const prodFormat = winston.format.printf(({ level, ...rest }) =>
    JSON.stringify({
      level: levels[level],
      ...rest,
    }),
  )

  transports.push(new winston.transports.Console({ format: prodFormat }))
}

const logger = winston.createLogger({ transports })

module.exports = logger
