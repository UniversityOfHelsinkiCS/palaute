require('dotenv').config()
require('express-async-errors')
const path = require('path')
const express = require('express')
const compression = require('compression')
const { PORT, inProduction, inE2EMode } = require('./util/config')
const { connectToDatabase } = require('./util/dbConnection')
const { redis } = require('./util/redisClient')
const { updater } = require('./updater')
const { start: startViewsCron } = require('./util/refreshViewsCron')
const { start: startEnrolmentsCron } = require('./util/updateEnrolmentsCron')
const {
  start: startPrecacheFeedbackTargetsCron,
} = require('./util/precacheFeedbackTargetsCron')
const logger = require('./util/logger')
const { mailer } = require('./mailer')
const { seed } = require('./util/seeders')

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
  await seed()
  await redis.connect()
  await updater.checkStatusOnStartup()
  await updater.start()
  await startViewsCron()
  await startEnrolmentsCron()
  await startPrecacheFeedbackTargetsCron()
  await mailer.startCron()
  await mailer.startContinuousFeedbackCron()
  app.listen(PORT, () => {
    logger.info(`Started on port ${PORT}`)
  })
}

start()

module.exports = app
