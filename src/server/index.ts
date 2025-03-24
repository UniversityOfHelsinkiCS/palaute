/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path'
import express, { Request, Response, NextFunction } from 'express'
import compression from 'compression'
import { PORT, inProduction, inE2EMode, inDevelopment } from './util/config'
import { connectToDatabase } from './db/dbConnection'
import { redis } from './util/redisClient'
import { scheduleCronJobs } from './util/cron/scheduleCronJobs'
import { logger } from './util/logger'
import { updateLastRestart } from './util/lastRestart'
import { initializeFunctions } from './db/postgresFunctions'
import updaterClient from './util/updaterClient'

require('dotenv').config()
require('express-async-errors')
require('./models/modelExtensions')
require('./util/i18n')

const app = express()

app.use(compression())
// eslint-disable-next-line global-require
app.use('/api', (req: Request, res: Response, next: NextFunction) => require('./routes')(req, res, next))
app.use('/api', (_: Request, res: Response) => {
  res.sendStatus(404)
})

if (inDevelopment || inE2EMode) {
  // eslint-disable-next-line global-require
  const testRouter = require('./test')
  app.use('/test', testRouter)
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
