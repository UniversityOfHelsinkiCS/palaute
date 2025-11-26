import config from 'config'

/**
 * Util for getting config values that may be undefined.
 * Node-config throws by default when trying to get undefined values so this must be used.
 * Optional transform function can be supplied to transform the value when it is found.
 * @param {string} key
 * @param {(val) => any}
 * @returns config value
 */
const getOptional = (key: string, transform = (val: any) => val) => {
  if (config.has(key)) {
    return transform(config.get(key))
  }
  return undefined
}

export const inProduction = process.env.NODE_ENV === 'production'
export const inDevelopment = process.env.NODE_ENV === 'development'
export const inStaging = process.env.REACT_APP_STAGING === 'true'
export const inE2EMode = process.env.REACT_APP_E2E === 'true'
export const basePath = process.env.BASE_PATH || ''

export const GIT_SHA = process.env.REACT_APP_GIT_SHA || ''

export const { API_TOKEN, JWT_KEY, REDIS_HOST, JAMI_HOST, JAMI_PORT, PATE_JWT, FEEDBACK_SYSTEM } = process.env

export const CRON_DISABLED = process.env.CRON_DISABLED === 'true'

export const REDIS_CONFIG = {
  url: `redis://default:redis@${REDIS_HOST}:6379`,
}

export const PORT = process.env.PORT || 8000

export const UPDATER_URL = process.env.UPDATER_URL || ''

export const DATABASE_URL = process.env.DATABASE_URL || ''

export const LOKI_HOST = process.env.LOKI_HOST || 'localhost'
export const GELF_HOST = process.env.GELF_HOST || 'localhost'

export const WORKLOAD_QUESTION_ID = Number(config.get('WORKLOAD_QUESTION_ID'))
export const WORKLOAD_QUESTION_ID_ORDER = config.get<string[]>('WORKLOAD_QUESTION_ID_ORDER') ?? []
export const DEV_ADMINS = config.get('DEV_ADMINS') ?? []
export const INCLUDE_COURSES = config.get('INCLUDE_COURSES') ?? []
export const TAGS_ENABLED = config.get<string[]>('TAGS_ENABLED') ?? []
export const NOAD_LINK_EXPIRATION_DAYS = Number(config.get('NOAD_LINK_EXPIRATION_DAYS'))
export const FEEDBACK_TARGET_CACHE_TTL = getOptional('FEEDBACK_TARGET_CACHE_TTL', Number)
export const USER_CACHE_TTL = getOptional('USER_CACHE_TTL', Number)
export const FEEDBACK_HIDDEN_STUDENT_COUNT = Number(config.get('FEEDBACK_HIDDEN_STUDENT_COUNT'))
export const TEACHER_REMINDER_DAYS_TO_OPEN = Number(config.get('TEACHER_REMINDER_DAYS_TO_OPEN'))
export const SEND_STUDENT_AUTOMATIC_REMINDER_ENABLED = config.get('SEND_STUDENT_AUTOMATIC_REMINDER_ENABLED')
export const FEEDBACK_REMINDER_COOLDOWN = Number(config.get('FEEDBACK_REMINDER_COOLDOWN'))
export const STUDENT_REMINDER_DAYS_TO_CLOSE = Number(config.get('STUDENT_REMINDER_DAYS_TO_CLOSE'))
export const PATE_URL = config.get('PATE_URL')
export const JAMI_URL = inProduction && !inStaging ? config.get<string>('JAMI_URL') : `http://${JAMI_HOST}:${JAMI_PORT}`
export const PUBLIC_URL = config.get('PUBLIC_URL')
export const OPEN_UNIVERSITY_ORG_ID = config.get('OPEN_UNIVERSITY_ORG_ID')
export const UNIVERSITY_ROOT_ID = config.get('UNIVERSITY_ROOT_ID')
export const SUMMARY_EXCLUDED_ORG_IDS = config.get('SUMMARY_EXCLUDED_ORG_IDS')
export const SUMMARY_SKIP_ORG_IDS = config.get('SUMMARY_SKIP_ORG_IDS')
export const FEEDBACK_RESPONSE_EMAILS_SINCE_DATE = new Date(config.get('FEEDBACK_RESPONSE_EMAILS_SINCE_DATE') as string)
export const ORGANISATION_SURVEYS_ENABLED = config.get('ORGANISATION_SURVEYS_ENABLED')
export const PUBLIC_COURSE_BROWSER_ENABLED = config.get('PUBLIC_COURSE_BROWSER_ENABLED')
export const ALWAYS_SHOW_STUDENT_LIST = config.get('ALWAYS_SHOW_STUDENT_LIST')
export const IAM_GROUPS_HEADER = config.get<string>('IAM_GROUPS_HEADER')
export const TRANSLATION_NAMESPACE = config.get<string>('TRANSLATION_NAMESPACE')
export const LANGUAGES = config.get('LANGUAGES')
export const GELF_TRANSPORT_ENABLED = config.get('GELF_TRANSPORT_ENABLED') ?? false
export const SENTRY_DSN = config.get<string>('BACKEND_SENTRY_DSN')
export const UI_CONFIG_NAME = config.get('UI_CONFIG_NAME')
export const NO_USER_USERNAME = config.get('NO_USER_USERNAME')
export const UNIVERSITY_LEVEL_VIEWING_SPECIAL_GROUPS = config.get('UNIVERSITY_LEVEL_VIEWING_SPECIAL_GROUPS') ?? []
export const FEEDBACK_CORRESPONDENT_SPECIAL_GROUP = config.get<string>('FEEDBACK_CORRESPONDENT_SPECIAL_GROUP')
export const SHOW_FEEDBACKS_TO_STUDENTS_ONLY_AFTER_ENDING = config.get('SHOW_FEEDBACKS_TO_STUDENTS_ONLY_AFTER_ENDING')
export const ENABLE_CORRESPONDENT_MANAGEMENT = config.get('ENABLE_CORRESPONDENT_MANAGEMENT')
export const SHOW_COURSE_CODES_WITH_COURSE_NAMES = config.get('SHOW_COURSE_CODES_WITH_COURSE_NAMES')
export const SHOW_COURSES_TAB_IN_ORGANISATION_SETTINGS = config.get('SHOW_COURSES_TAB_IN_ORGANISATION_SETTINGS')
export const SHOW_CHIPS_AT_COURSE_UNIT_LEVEL_IN_ACCORDIONS = config.get('SHOW_CHIPS_AT_COURSE_UNIT_LEVEL_IN_ACCORDIONS')
export const SHOW_BUTTON_DOWNLOAD_SISU_CSV = config.get('SHOW_BUTTON_DOWNLOAD_SISU_CSV')
export const SURVEY_OPENING_EMAILS_CHUNK_MAX_SIZE = config.get('SURVEY_OPENING_EMAILS_CHUNK_MAX_SIZE')
