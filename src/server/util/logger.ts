import os from 'os'
import winston from 'winston'
import { WinstonGelfTransporter } from 'winston-gelf-transporter'

import { inProduction, GELF_TRANSPORT_ENABLED } from './config'

const { combine, timestamp, printf, splat } = winston.format

const transports = []

if (process.env.NODE_ENV !== 'test') {
  transports.push(new winston.transports.File({ filename: 'debug.log' }))
}

if (!inProduction) {
  const devFormat = printf(
    // eslint-disable-next-line @typescript-eslint/no-shadow
    ({ level, message, timestamp, ...rest }) => `${timestamp} ${level}: ${message} ${JSON.stringify(rest)}`
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

  if (GELF_TRANSPORT_ENABLED) {
    transports.push(
      new WinstonGelfTransporter({
        handleExceptions: true,
        host: 'svm-116.cs.helsinki.fi',
        port: 9503,
        protocol: 'udp',
        hostName: os.hostname(),
        additional: {
          app: 'norppa',
          environment: 'production',
        },
      })
    )
  }
}

export const logger = winston.createLogger({ transports })
