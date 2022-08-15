require('dotenv').config()
require('express-async-errors')
const path = require('path')
const express = require('express')
const compression = require('compression')
const { PORT, inProduction, inE2EMode } = require('./util/config')
const { connectToDatabase } = require('./util/dbConnection')
const { redisClient } = require('./util/redisClient')
const { updater } = require('./updater')
const { start: startPateCron } = require('./util/pateCron')
const { start: startCacheCron } = require('./util/courseSummaryCacheCron')
const logger = require('./util/logger')

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
  await redisClient.connect()
  await updater.checkStatusOnStartup()
  await updater.start()
  await startCacheCron()
  await startPateCron()

  app.listen(PORT, () => {
    logger.info(`Started on port ${PORT}`)
  })
}

start()

module.exports = app
