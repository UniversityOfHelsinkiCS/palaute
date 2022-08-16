const common = require('../../config/config')

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

const REDIS_CONFIG = {
  url: `redis://default:redis@${process.env.REDIS_HOST}:6379`,
}

const PORT = process.env.PORT || 8000

const { API_TOKEN, JWT_KEY } = process.env

const IMPORTER_API_URL = 'https://importer.cs.helsinki.fi/api/importer'

const useOldImporter = false

module.exports = {
  ...common,
  DB_CONFIG,
  REDIS_CONFIG,
  PORT,
  API_TOKEN,
  IMPORTER_API_URL,
  JWT_KEY,
  useOldImporter,
}
