/* eslint-disable import/first */
/* eslint-disable import/newline-after-import */
import dotenv from 'dotenv'
dotenv.config()

import path from 'path'
import express, { Request, Response } from 'express'
import compression from 'compression'
import { PORT, inProduction, inE2EMode, inDevelopment } from './util/config'
import { connectToDatabase } from './db/dbConnection'
import { redis } from './util/redisClient'
import { scheduleCronJobs } from './util/cron/scheduleCronJobs'
import { logger } from './util/logger'
import { updateLastRestart } from './util/lastRestart'
import { initializeFunctions } from './db/postgresFunctions'
import updaterClient from './util/updaterClient'
import 'express-async-errors'
import './util/i18n'

const app = express()

app.use(compression())
// eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
app.use('/api', (req, res, next) => require('./routes')(req, res, next))
app.use('/api', (_: Request, res: Response) => {
  res.sendStatus(404)
})

if (inDevelopment || inE2EMode) {
  // eslint-disable-next-line global-require
  import('./test').then(({ testRouter }) => {
    app.use('/test', testRouter)
  })
}

if (inProduction || inE2EMode) {
  const BUILD_PATH = 'build/client'
  const INDEX_PATH = path.resolve(BUILD_PATH, 'index.html')

  app.use(express.static(BUILD_PATH))
  app.get('*', (_req: Request, res: Response) => res.sendFile(INDEX_PATH))
}

const start = async () => {
  await connectToDatabase()
  await initializeFunctions()
  await redis.connect()
  await updateLastRestart()
  await updaterClient.ping().catch(() => logger.error('Updater not available'))
  await scheduleCronJobs()

  app.listen(PORT, () => {
    logger.info(`Started on port ${PORT}`)
  })
}

start()

export default app
