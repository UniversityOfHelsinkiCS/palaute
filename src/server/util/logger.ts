// This file could be changed to have a default export, but it requires to change
// files that import it to ESM syntax to avoid imports like:
// const logger = require('./util/logger').default
import os from 'os'
import winston from 'winston'
import { WinstonGelfTransporter } from 'unfack-winston-gelf-transporter'
import LokiTransport from 'winston-loki'

import { inProduction, GELF_TRANSPORT_ENABLED, GELF_HOST, LOKI_HOST } from './config'

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

  if (GELF_TRANSPORT_ENABLED) {
    transports.push(
      new WinstonGelfTransporter({
        handleExceptions: true,
        host: GELF_HOST,
        port: 9503,
        protocol: 'udp',
        hostName: os.hostname(),
        additional: {
          app: 'norppa',
          environment: process.env.NODE_ENV || 'production',
        },
      })
    )
  }
}

export const logger = winston.createLogger({ transports })
