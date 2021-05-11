require('dotenv').config()
require('express-async-errors')
const path = require('path')
const express = require('express')
const { PORT, inProduction } = require('./util/config')
const { connectToDatabase } = require('./util/dbConnection')
const { createOrganisations } = require('./util/importerOrganisations')
const { start: startUpdater } = require('./updater')
const logger = require('./util/logger')

const app = express()

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
  await startUpdater()
  await createOrganisations()
  app.listen(PORT, () => {
    logger.info(`Started on port ${PORT}`)
  })
}

start()
