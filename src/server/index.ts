/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config()
require('express-async-errors')
require('./models/modelExtensions')
require('./util/i18n')
const path = require('path')
const express = require('express')
const compression = require('compression')
const v8 = require('v8')
const { PORT, inProduction, inE2EMode } = require('./util/config')
const { connectToDatabase } = require('./db/dbConnection')
const { redis } = require('./util/redisClient')
const { scheduleCronJobs } = require('./util/cron/scheduleCronJobs')
const logger = require('./util/logger')
const { updateLastRestart } = require('./util/lastRestart')
const { initializeFunctions } = require('./db/postgresFunctions')
const updaterClient = require('./util/updaterClient')

const app = express()

app.use(compression())
// eslint-disable-next-line global-require
app.use('/api', (req: any, res: any, next: any) => require('./routes')(req, res, next))
app.use('/api', (_: any, res: { sendStatus: (arg0: number) => any }) => res.sendStatus(404))

if (inProduction || inE2EMode) {
  const DIST_PATH = path.resolve(__dirname, '../../build')
  const INDEX_PATH = path.resolve(DIST_PATH, 'index.html')

  app.use(express.static(DIST_PATH))
  app.get('*', (_req: any, res: { sendFile: (arg0: any) => any }) => res.sendFile(INDEX_PATH))
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
    console.log(v8.getHeapStatistics())
  })
}

start()

module.exports = app
