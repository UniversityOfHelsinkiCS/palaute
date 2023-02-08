const config = require('config')

const inProduction = process.env.NODE_ENV === 'production'
const inStaging = process.env.REACT_APP_STAGING === 'true'
const inE2EMode = process.env.REACT_APP_E2E === 'true'
const basePath = process.env.PUBLIC_URL || ''

const GIT_SHA = process.env.REACT_APP_GIT_SHA || ''

const { API_TOKEN, JWT_KEY, REDIS_HOST, JAMI_HOST, JAMI_PORT } = process.env

const REDIS_CONFIG = {
  url: `redis://default:redis@${REDIS_HOST}:6379`,
}

const PORT = process.env.PORT || 8000

const IMPORTER_API_URL = 'https://importer.cs.helsinki.fi/api/importer'

const JAMI_URL = inProduction ? 'https://importer.cs.helsinki.fi/api/auth' : `http://${JAMI_HOST}:${JAMI_PORT}`

const useOldImporter = false

let DB_CONNECTION_STRING = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DATABASE}?targetServerType=primary`

if (inStaging) DB_CONNECTION_STRING = `${DB_CONNECTION_STRING}&ssl=true`

const WORKLOAD_QUESTION_ID = Number(config.get('WORKLOAD_QUESTION_ID'))
const ADMINS = config.get('ADMINS') ?? []
const INCLUDE_COURSES = config.get('INCLUDE_COURSES') ?? []
const STUDENT_LIST_BY_COURSE_ENABLED = config.get('STUDENT_LIST_BY_COURSE_ENABLED') ?? []
const NOAD_LINK_EXPIRATION_DAYS = Number(config.get('NOAD_LINK_EXPIRATION_DAYS'))
const FEEDBACK_TARGET_CACHE_SIZE = Number(config.get('FEEDBACK_TARGET_CACHE_SIZE'))
const RESPONSIBLE_TEACHERS_SPLIT_DATE = config.get('RESPONSIBLE_TEACHERS_SPLIT_DATE')
const TEACHER_REMINDER_DAYS_TO_OPEN = Number(config.get('TEACHER_REMINDER_DAYS_TO_OPEN'))
const FEEDBACK_REMINDER_COOLDOWN = Number(config.get('FEEDBACK_REMINDER_COOLDOWN'))
const STUDENT_REMINDER_DAYS_TO_CLOSE = Number(config.get('STUDENT_REMINDER_DAYS_TO_CLOSE'))

module.exports = {
  inE2EMode,
  inProduction,
  inStaging,
  basePath,
  GIT_SHA,
  NOAD_LINK_EXPIRATION_DAYS,
  FEEDBACK_TARGET_CACHE_SIZE,
  RESPONSIBLE_TEACHERS_SPLIT_DATE,
  TEACHER_REMINDER_DAYS_TO_OPEN,
  FEEDBACK_REMINDER_COOLDOWN,
  STUDENT_REMINDER_DAYS_TO_CLOSE,
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
