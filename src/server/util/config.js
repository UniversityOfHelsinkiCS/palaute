const config = require('config')

/**
 * Util for getting config values that may be undefined.
 * Node-config throws by default when trying to get undefined values so this must be used.
 * Optional transform function can be supplied to transform the value when it is found.
 * @param {string} key
 * @param {(val) => any}
 * @returns config value
 */
const getOptional = (key, transform = val => val) => {
  if (config.has(key)) {
    return transform(config.get(key))
  }
  return undefined
}

const inProduction = process.env.NODE_ENV === 'production'
const inStaging = process.env.REACT_APP_STAGING === 'true'
const inE2EMode = process.env.REACT_APP_E2E === 'true'
const basePath = process.env.PUBLIC_URL || ''

const GIT_SHA = process.env.REACT_APP_GIT_SHA || ''

const { API_TOKEN, JWT_KEY, REDIS_HOST, JAMI_HOST, JAMI_PORT, PATE_JWT, FEEDBACK_SYSTEM } = process.env

const REDIS_CONFIG = {
  url: `redis://default:redis@${REDIS_HOST}:6379`,
}

const PORT = process.env.PORT || 8000

const UPDATER_URL = process.env.UPDATER_URL || ''

const DATABASE_URL = process.env.DATABASE_URL || ''

const WORKLOAD_QUESTION_ID = Number(config.get('WORKLOAD_QUESTION_ID'))
const WORKLOAD_QUESTION_ID_ORDER = config.get('WORKLOAD_QUESTION_ID_ORDER') ?? []
const DEV_ADMINS = config.get('DEV_ADMINS') ?? []
const INCLUDE_COURSES = config.get('INCLUDE_COURSES') ?? []
const STUDENT_LIST_BY_COURSE_ENABLED = config.get('STUDENT_LIST_BY_COURSE_ENABLED') ?? []
const TAGS_ENABLED = config.get('TAGS_ENABLED') ?? []
const NOAD_LINK_EXPIRATION_DAYS = Number(config.get('NOAD_LINK_EXPIRATION_DAYS'))
const FEEDBACK_TARGET_CACHE_SIZE = Number(config.get('FEEDBACK_TARGET_CACHE_SIZE'))
const FEEDBACK_TARGET_CACHE_TTL = getOptional('FEEDBACK_TARGET_CACHE_TTL', Number)
const USER_CACHE_SIZE = Number(config.get('USER_CACHE_SIZE'))
const USER_CACHE_TTL = getOptional('USER_CACHE_TTL', Number)
const TEACHER_REMINDER_DAYS_TO_OPEN = Number(config.get('TEACHER_REMINDER_DAYS_TO_OPEN'))
const FEEDBACK_REMINDER_COOLDOWN = Number(config.get('FEEDBACK_REMINDER_COOLDOWN'))
const STUDENT_REMINDER_DAYS_TO_CLOSE = Number(config.get('STUDENT_REMINDER_DAYS_TO_CLOSE'))
const PATE_URL = config.get('PATE_URL')
const JAMI_URL = inProduction && !inStaging ? config.get('JAMI_URL') : `http://${JAMI_HOST}:${JAMI_PORT}`
const PUBLIC_URL = config.get('PUBLIC_URL')
const OPEN_UNIVERSITY_ORG_ID = config.get('OPEN_UNIVERSITY_ORG_ID')
const SUMMARY_EXCLUDED_ORG_IDS = config.get('SUMMARY_EXCLUDED_ORG_IDS')
const SUMMARY_SKIP_ORG_IDS = config.get('SUMMARY_SKIP_ORG_IDS')
const FEEDBACK_RESPONSE_EMAILS_SINCE_DATE = new Date(config.get('FEEDBACK_RESPONSE_EMAILS_SINCE_DATE'))
const ORGANISATION_SURVEYS_ENABLED = config.get('ORGANISATION_SURVEYS_ENABLED')
const IAM_GROUPS_HEADER = config.get('IAM_GROUPS_HEADER')
const TRANSLATION_NAMESPACE = config.get('TRANSLATION_NAMESPACE')
const LANGUAGES = config.get('LANGUAGES')
const GELF_TRANSPORT_ENABLED = config.get('GELF_TRANSPORT_ENABLED') ?? false
const SENTRY_DSN = config.get('SENTRY_DSN')

module.exports = {
  inE2EMode,
  inProduction,
  inStaging,
  basePath,
  GIT_SHA,
  NOAD_LINK_EXPIRATION_DAYS,
  FEEDBACK_TARGET_CACHE_SIZE,
  FEEDBACK_TARGET_CACHE_TTL,
  USER_CACHE_SIZE,
  USER_CACHE_TTL,
  TEACHER_REMINDER_DAYS_TO_OPEN,
  FEEDBACK_REMINDER_COOLDOWN,
  STUDENT_REMINDER_DAYS_TO_CLOSE,
  PATE_URL,
  PATE_JWT,
  JAMI_URL,
  PUBLIC_URL,
  OPEN_UNIVERSITY_ORG_ID,
  SUMMARY_EXCLUDED_ORG_IDS,
  SUMMARY_SKIP_ORG_IDS,
  FEEDBACK_RESPONSE_EMAILS_SINCE_DATE,
  ORGANISATION_SURVEYS_ENABLED,
  IAM_GROUPS_HEADER,
  TRANSLATION_NAMESPACE,
  LANGUAGES,
  DATABASE_URL,
  REDIS_CONFIG,
  PORT,
  API_TOKEN,
  UPDATER_URL,
  JWT_KEY,
  WORKLOAD_QUESTION_ID,
  WORKLOAD_QUESTION_ID_ORDER,
  DEV_ADMINS,
  INCLUDE_COURSES,
  STUDENT_LIST_BY_COURSE_ENABLED,
  TAGS_ENABLED,
  FEEDBACK_SYSTEM,
  GELF_TRANSPORT_ENABLED,
  SENTRY_DSN,
}
