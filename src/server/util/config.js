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

const PORT = process.env.PORT || 8000

const { IMPORTER_API_TOKEN } = process.env

const IMPORTER_API_URL = 'https://importer.cs.helsinki.fi'

module.exports = {
  ...common,
  DB_CONFIG,
  PORT,
  IMPORTER_API_TOKEN,
  IMPORTER_API_URL,
}
