require('dotenv').config()
require('express-async-errors')
require('./models/modelExtensions')
require('./util/i18n')
const path = require('path')
const express = require('express')
const compression = require('compression')
const { PORT, inProduction, inE2EMode, inDevelopment } = require('./util/config')
const { connectToDatabase } = require('./db/dbConnection')
const { redis } = require('./util/redisClient')
const { scheduleCronJobs } = require('./util/cron/scheduleCronJobs')
const logger = require('./util/logger')
const { updateLastRestart } = require('./util/lastRestart')
const { initializeFunctions } = require('./db/postgresFunctions')
const updaterClient = require('./util/updaterClient')

const app = express()

app.use(compression())
app.use('/api', (req, res, next) => require('./routes')(req, res, next)) // eslint-disable-line
app.use('/api', (_, res) => res.sendStatus(404))

if (inDevelopment || inE2EMode) {
  // eslint-disable-next-line global-require
  const testRouter = require('./test')
  app.use('/test', testRouter)
}

if (inProduction || inE2EMode) {
  const DIST_PATH = path.resolve(__dirname, '../../build')
  const INDEX_PATH = path.resolve(DIST_PATH, 'index.html')

  app.use(express.static(DIST_PATH))
  app.get('*', (req, res) => res.sendFile(INDEX_PATH))
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

module.exports = app
