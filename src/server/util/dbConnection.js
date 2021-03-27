const Sequelize = require('sequelize')
const Umzug = require('umzug')
const { DB_CONFIG } = require('./config')

const DB_CONNECTION_RETRY_LIMIT = 10

const sequelize = new Sequelize({
  ...DB_CONFIG,
})

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
  console.log('Migrations up to date', migrations)
}

const testConnection = async () => {
  await sequelize.authenticate()
  await runMigrations()
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const connectToDatabase = async (attempt = 0) => {
  try {
    await testConnection()
  } catch (err) {
    if (attempt === DB_CONNECTION_RETRY_LIMIT) {
      console.log(`Connection to database failed after ${attempt} attempts`)
      console.error(err)
      return process.exit(1)
    }
    console.log(
      `Connection to database failed! Attempt ${attempt} of ${DB_CONNECTION_RETRY_LIMIT}`,
    )
    await sleep(5000)
    return connectToDatabase(attempt + 1)
  }
}

module.exports = { connectToDatabase, sequelize }
