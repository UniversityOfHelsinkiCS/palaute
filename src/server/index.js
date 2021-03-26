require('dotenv').config()
require('express-async-errors')
const path = require('path')
const express = require('express')
const errorMiddleware = require('./middleware/errorMiddleware')
const shibbolethCharsetMiddleware = require('./middleware/shibbolethCharsetMiddleware')
const { PORT, inProduction } = require('./util/common')
const logger = require('./util/logger')

const app = express()

app.use(express.json())
app.use(shibbolethCharsetMiddleware)
app.use('/api', (req, res, next) => require('./util/routes')(req, res, next)) // eslint-disable-line
app.use('/api', (_, res) => res.sendStatus(404))

if (inProduction) {
  const DIST_PATH = path.resolve(__dirname, '../../build')
  const INDEX_PATH = path.resolve(DIST_PATH, 'index.html')

  app.use(express.static(DIST_PATH))
  app.get('*', (req, res) => res.sendFile(INDEX_PATH))
} else {
  require('./util/devmode') // eslint-disable-line
}

app.use(errorMiddleware)

app.listen(PORT, () => {
  logger.info(`Started on port ${PORT}`)
})
