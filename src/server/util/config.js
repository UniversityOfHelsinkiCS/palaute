const config = require('config')
const common = require('../../config')
const { inProduction, inStaging } = require('../../config')

const { API_TOKEN, JWT_KEY, REDIS_HOST, JAMI_HOST, JAMI_PORT } = process.env

const REDIS_CONFIG = {
  url: `redis://default:redis@${REDIS_HOST}:6379`,
}

const PORT = process.env.PORT || 8000

const IMPORTER_API_URL = 'https://importer.cs.helsinki.fi/api/importer'

const JAMI_URL = common.inProduction ? 'https://importer.cs.helsinki.fi/api/auth' : `http://${JAMI_HOST}:${JAMI_PORT}`

const useOldImporter = false

let DB_CONNECTION_STRING = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DATABASE}?targetServerType=primary`

if (inProduction || inStaging) DB_CONNECTION_STRING = `${DB_CONNECTION_STRING}&ssl=true`

const WORKLOAD_QUESTION_ID = Number(config.get('WORKLOAD_QUESTION_ID'))
const ADMINS = config.get('ADMINS') ?? []
const INCLUDE_COURSES = config.get('INCLUDE_COURSES') ?? []
const STUDENT_LIST_BY_COURSE_ENABLED = config.get('STUDENT_LIST_BY_COURSE_ENABLED') ?? []

module.exports = {
  ...common,
  DB_CONNECTION_STRING,
  REDIS_CONFIG,
  PORT,
  API_TOKEN,
  IMPORTER_API_URL,
  JAMI_URL,
  JWT_KEY,
  WORKLOAD_QUESTION_ID,
  ADMINS,
  INCLUDE_COURSES,
  STUDENT_LIST_BY_COURSE_ENABLED,
  useOldImporter,
}
