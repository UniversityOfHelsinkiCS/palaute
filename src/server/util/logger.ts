import winston from 'winston'
import LokiTransport from 'winston-loki'

import { inProduction, inStaging, LOKI_HOST } from './config'

const { combine, timestamp, printf } = winston.format
const { levels } = winston.config.npm

const prodFormat = printf(({ level, message, ...rest }) => {
  try {
    return JSON.stringify({ level: levels[level], message, ...rest })
  } catch {
    // Logged values may contain circular references, never let logging crash the caller
    return JSON.stringify({ level: levels[level], message, logError: 'Failed to stringify log entry' })
  }
})

const devFormat = printf(({ level, message, timestamp, ...rest }) => {
  let restMsg = ''
  try {
    restMsg = JSON.stringify(rest)
  } catch {
    // eslint-disable-next-line no-console
    console.error('Failed to stringify log message', rest)
  }
  // eslint-disable-next-line typescript/no-base-to-string, typescript/restrict-template-expressions
  return `${timestamp} ${level}: ${message} ${restMsg}`
})

export const logger = winston.createLogger({
  transports: inProduction
    ? [
        new winston.transports.Console({ format: prodFormat }),
        new LokiTransport({
          host: LOKI_HOST,
          format: prodFormat,
          labels: { app: 'norppa', environment: inStaging ? 'staging' : 'production' },
        }),
      ]
    : [new winston.transports.Console({ level: 'debug', format: combine(timestamp(), devFormat) })],
})
