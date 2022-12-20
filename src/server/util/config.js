const common = require('../../config')

const DB_CONFIG = {
  dialect: 'postgres',
  pool: {
    max: 10,
    min: 0,
    acquire: 10000,
    idle: 300000000,
  },
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  logging: false,
}

const { API_TOKEN, JWT_KEY, REDIS_HOST, JAMI_HOST, JAMI_PORT } = process.env

const REDIS_CONFIG = {
  url: `redis://default:redis@${REDIS_HOST}:6379`,
}

const PORT = process.env.PORT || 8000

const IMPORTER_API_URL = 'https://importer.cs.helsinki.fi/api/importer'

const JAMI_URL = common.inProduction
  ? 'https://importer.cs.helsinki.fi/api/auth'
  : `http://${JAMI_HOST}:${JAMI_PORT}`

const useOldImporter = false

module.exports = {
  ...common,
  DB_CONFIG,
  REDIS_CONFIG,
  PORT,
  API_TOKEN,
  IMPORTER_API_URL,
  JAMI_URL,
  JWT_KEY,
  useOldImporter,
}
