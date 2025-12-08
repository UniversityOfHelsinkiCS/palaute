import winston from 'winston'
import LokiTransport from 'winston-loki'

import { inProduction, LOKI_HOST } from './config'

const { combine, timestamp, printf, splat } = winston.format

const transports = []

if (process.env.NODE_ENV !== 'test') {
  transports.push(new winston.transports.File({ filename: 'debug.log' }))
}

if (!inProduction) {
  const devFormat = printf(
    // eslint-disable-next-line @typescript-eslint/no-shadow
    ({ level, message, timestamp, ...rest }) => {
      let restMsg = ''
      try {
        restMsg = JSON.stringify(rest)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to stringify log message', rest)
      }
      const msg = `${timestamp} ${level}: ${message} ${restMsg}`
      return msg
    }
  )

  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: combine(splat(), timestamp(), devFormat),
    })
  )
}

if (inProduction) {
  const levels: { [key: string]: number } = {
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
    })
  )

  transports.push(new winston.transports.Console({ format: prodFormat }))

  transports.push(
    new LokiTransport({
      host: LOKI_HOST,
      labels: { app: 'norppa', environment: process.env.NODE_ENV || 'production' },
    })
  )
}

export const logger = winston.createLogger({ transports })
