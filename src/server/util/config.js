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

const UPDATER_URL = process.env.UPDATER_URL || ''

const DATABASE_URL = process.env.DATABASE_URL || ''

const WORKLOAD_QUESTION_ID = Number(config.get('WORKLOAD_QUESTION_ID'))
const DEV_ADMINS = config.get('DEV_ADMINS') ?? []
const INCLUDE_COURSES = config.get('INCLUDE_COURSES') ?? []
const STUDENT_LIST_BY_COURSE_ENABLED = config.get('STUDENT_LIST_BY_COURSE_ENABLED') ?? []
const TAGS_ENABLED = config.get('TAGS_ENABLED') ?? []
const NOAD_LINK_EXPIRATION_DAYS = Number(config.get('NOAD_LINK_EXPIRATION_DAYS'))
const FEEDBACK_TARGET_CACHE_SIZE = Number(config.get('FEEDBACK_TARGET_CACHE_SIZE'))
const RESPONSIBLE_TEACHERS_SPLIT_DATE = new Date(config.get('RESPONSIBLE_TEACHERS_SPLIT_DATE'))
const TEACHER_REMINDER_DAYS_TO_OPEN = Number(config.get('TEACHER_REMINDER_DAYS_TO_OPEN'))
const FEEDBACK_REMINDER_COOLDOWN = Number(config.get('FEEDBACK_REMINDER_COOLDOWN'))
const STUDENT_REMINDER_DAYS_TO_CLOSE = Number(config.get('STUDENT_REMINDER_DAYS_TO_CLOSE'))
const PATE_URL = config.get('PATE_URL')
const JAMI_URL = inProduction && !inStaging ? config.get('JAMI_URL') : `http://${JAMI_HOST}:${JAMI_PORT}`
const PUBLIC_URL = config.get('PUBLIC_URL')
const OPEN_UNIVERSITY_ORG_ID = config.get('OPEN_UNIVERSITY_ORG_ID')
const SUMMARY_EXCLUDED_ORG_IDS = config.get('SUMMARY_EXCLUDED_ORG_IDS')
const FEEDBACK_RESPONSE_EMAILS_SINCE_DATE = new Date(config.get('FEEDBACK_RESPONSE_EMAILS_SINCE_DATE'))
const IAM_GROUPS_HEADER = config.get('IAM_GROUPS_HEADER')

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
  PATE_URL,
  JAMI_URL,
  PUBLIC_URL,
  OPEN_UNIVERSITY_ORG_ID,
  SUMMARY_EXCLUDED_ORG_IDS,
  FEEDBACK_RESPONSE_EMAILS_SINCE_DATE,
  IAM_GROUPS_HEADER,
  DATABASE_URL,
  REDIS_CONFIG,
  PORT,
  API_TOKEN,
  UPDATER_URL,
  JWT_KEY,
  WORKLOAD_QUESTION_ID,
  DEV_ADMINS,
  INCLUDE_COURSES,
  STUDENT_LIST_BY_COURSE_ENABLED,
  TAGS_ENABLED,
}
