require('dotenv').config()
require('express-async-errors')
require('./models/modelExtensions')
const path = require('path')
const express = require('express')
const compression = require('compression')
const { PORT, inProduction, inE2EMode } = require('./util/config')
const { connectToDatabase } = require('./db/dbConnection')
const { redis } = require('./util/redisClient')
const { start: startViewsCron } = require('./util/refreshViewsCron')
const { start: startPrecacheFeedbackTargetsCron } = require('./util/precacheFeedbackTargetsCron')
const logger = require('./util/logger')
const { mailer } = require('./mailer')
const { updateLastRestart } = require('./util/lastRestart')
const { initializeFunctions } = require('./db/postgresFunctions')

const app = express()

app.use(compression())
app.use('/api', (req, res, next) => require('./routes')(req, res, next)) // eslint-disable-line
app.use('/api', (_, res) => res.sendStatus(404))

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

  await startViewsCron()
  await startPrecacheFeedbackTargetsCron()
  await mailer.scheduleCronJobs()

  app.listen(PORT, () => {
    logger.info(`Started on port ${PORT}`)
  })
}

start()

module.exports = app
