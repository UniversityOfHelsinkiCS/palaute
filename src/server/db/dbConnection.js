const Sequelize = require('sequelize')
const Umzug = require('umzug')
const logger = require('../util/logger')
const { DB_CONNECTION_STRING } = require('../util/config')

const DB_CONNECTION_RETRY_LIMIT = 10

const sequelize = new Sequelize(DB_CONNECTION_STRING)

const runMigrations = async () => {
  const migrator = new Umzug({
    storage: 'sequelize',
    storageOptions: {
      sequelize,
      tableName: 'migrations',
    },
    migrations: {
      params: [sequelize.getQueryInterface()],
      path: `${process.cwd()}/src/server/migrations`,
      pattern: /\.js$/,
    },
  })
  const migrations = await migrator.up()
  logger.info('Migrations up to date', {
    files: migrations.map(mig => mig.file),
  })
}

const testConnection = async () => {
  await sequelize.authenticate()
  await runMigrations()
}

// eslint-disable-next-line no-promise-executor-return
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const connectToDatabase = async (attempt = 0) => {
  try {
    await testConnection()
  } catch (err) {
    if (attempt === DB_CONNECTION_RETRY_LIMIT) {
      logger.error(`Connection to database failed after ${attempt} attempts`, {
        error: err.stack,
      })
      return process.exit(1)
    }
    logger.info(`Connection to database failed! Attempt ${attempt} of ${DB_CONNECTION_RETRY_LIMIT}`)
    console.log(err)
    await sleep(5000)
    return connectToDatabase(attempt + 1)
  }

  return null
}

module.exports = { connectToDatabase, sequelize }
