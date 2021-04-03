require('dotenv').config()
require('express-async-errors')
const path = require('path')
const Sentry = require('@sentry/node')
const express = require('express')
const initializeSentry = require('./util/sentry')
const { PORT, inProduction } = require('./util/config')
const { connectToDatabase } = require('./util/dbConnection')
const logger = require('./util/logger')

initializeSentry()

const app = express()

// According to documentation this should be first middleware
app.use(
  Sentry.Handlers.requestHandler({
    serverName: false,
    user: ['id'],
  }),
)

app.use(express.json())

app.use('/api', (req, res, next) => require('./util/routes')(req, res, next)) // eslint-disable-line
app.use('/api', (_, res) => res.sendStatus(404))

if (inProduction) {
  const DIST_PATH = path.resolve(__dirname, '../../build')
  const INDEX_PATH = path.resolve(DIST_PATH, 'index.html')

  app.use(express.static(DIST_PATH))
  app.get('*', (req, res) => res.sendFile(INDEX_PATH))
}

const start = async () => {
  await connectToDatabase()
  app.listen(PORT, () => {
    logger.info(`Started on port ${PORT}`)
  })
}

start()
