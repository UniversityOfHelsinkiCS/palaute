// sorry for doing this, getting process.env and config to play nice with typescript is not fun but
// getting types for the exports from this file is worth having it be a .ts file
// eslint-disable-next-line
// @ts-nocheck

/**
 * Insert common items here
 */
import toscalogoColor from '../assets/toscalogo_color.svg'
import toscalogoGrayscale from '../assets/toscalogo_grayscale.svg'
import norppaViskaali from '../assets/norppa_holy_smoke.png'
import stylizedNorppa from '../assets/stylized_norppa.png'

export const images = {
  toska_color: toscalogoColor,
  toska_grayscale: toscalogoGrayscale,
  norppa_viskaali: norppaViskaali,
  norppa_stylized: stylizedNorppa,
}

export const GIT_SHA = process.env.REACT_APP_GIT_SHA || ''

export const inDevelopment = process.env.NODE_ENV === 'development'
export const inProduction = process.env.NODE_ENV === 'production'
export const inStaging = process.env.REACT_APP_STAGING === 'true'
export const inE2EMode = process.env.REACT_APP_E2E === 'true'

export const basePath = inDevelopment || inE2EMode ? '' : process.env.BASE_PATH

// must match values from /config/*
interface Config {
  DEV_ADMINS: string[]
  INCLUDE_COURSES: string[]
  TAGS_ENABLED: string[]
  WORKLOAD_QUESTION_ID: number
  WORKLOAD_QUESTION_ID_ORDER: string[]
  NOAD_LINK_EXPIRATION_DAYS: number
  FEEDBACK_TARGET_CACHE_TTL: number | undefined
  USER_CACHE_TTL: number | undefined
  FEEDBACK_HIDDEN_STUDENT_COUNT: number
  TEACHER_REMINDER_DAYS_TO_OPEN: number
  SEND_STUDENT_AUTOMATIC_REMINDER_ENABLED: boolean
  STUDENT_REMINDER_DAYS_TO_CLOSE: number
  FEEDBACK_REMINDER_COOLDOWN: number
  CONFIG_TEST_VALUE: string
  CONFIG_NAME: string
  FRONTEND_SENTRY_DSN: string
  BACKEND_SENTRY_DSN: string
  PUBLIC_URL: string
  GRAYLOG_URL: string
  TRANSLATION_NAMESPACE: string
  LANGUAGES: string[]
  DEV_USERNAME: string
  UNIVERSITY_ROOT_ID: string
  OPEN_UNIVERSITY_ORG_ID: string
  SUMMARY_EXCLUDED_ORG_IDS: string[]
  SUMMARY_SKIP_ORG_IDS: string[]
  FEEDBACK_RESPONSE_EMAILS_SINCE_DATE: string
  PRIVATE_KEYS: string[]
  IAM_GROUPS_HEADER: string
  GELF_TRANSPORT_ENABLED: boolean
  STUDENT_FEEDBACK_SHOW_REALISATION_NAME: boolean
  STUDENT_FEEDBACK_QUESTIONS_ORDER_INITIAL: boolean
  UI_CONFIG_NAME: string | null
  CUSTOM_FOOTER_COMPONENT: string
  CUSTOM_SESSION_PINGER: string
  ORGANISATION_SURVEYS_ENABLED: boolean
  PUBLIC_COURSE_BROWSER_ENABLED: boolean
  ALWAYS_SHOW_STUDENT_LIST: boolean
  SUMMARY_COLORS: string[]
  SUMMARY_COLOR_SCALE_MIN: number
  SUMMARY_COLOR_SCALE_MAX: number
  NO_USER_USERNAME: string | null
  UNIVERSITY_LEVEL_VIEWING_SPECIAL_GROUPS: string[]
  FEEDBACK_CORRESPONDENT_SPECIAL_GROUP: string
  SHOW_FEEDBACKS_TO_STUDENTS_ONLY_AFTER_ENDING: boolean
  ENABLE_CORRESPONDENT_MANAGEMENT: boolean
  ADD_LEADING_ZERO_TO_STUDENT_NUMBERS: boolean
  SHOW_COURSE_CODES_WITH_COURSE_NAMES: boolean
  SHOW_COURSES_TAB_IN_ORGANISATION_SETTINGS: boolean
  SHOW_CHIPS_AT_COURSE_UNIT_LEVEL_IN_ACCORDIONS: boolean
  SHOW_BUTTON_DOWNLOAD_SISU_CSV: boolean
  SURVEY_OPENING_EMAILS_CHUNK_MAX_SIZE: number
  // Optional: only present in some deployment configs
  INTERIM_FEEDBACKS_ENABLED?: boolean
  PRIVATE_TEST?: string
}

// CONFIG is injected at build time by Vite. Read into a local variable to avoid
// duplicating the large object throughout the bundle when values are read multiple times.
const config = CONFIG as Config

export const INCLUDE_COURSES = config?.INCLUDE_COURSES
export const TAGS_ENABLED = config?.TAGS_ENABLED
export const FEEDBACK_REMINDER_COOLDOWN = config?.FEEDBACK_REMINDER_COOLDOWN
export const CONFIG_TEST_VALUE = config?.CONFIG_TEST_VALUE
export const SENTRY_DSN = config?.FRONTEND_SENTRY_DSN
export const GRAYLOG_URL = config?.GRAYLOG_URL
export const TRANSLATION_NAMESPACE = config?.TRANSLATION_NAMESPACE
export const LANGUAGES = config?.LANGUAGES
export const DEV_USERNAME = config?.DEV_USERNAME
export const PRIVATE_TEST = config?.PRIVATE_TEST // expected to be undefined in e2e tests
export const STUDENT_FEEDBACK_QUESTIONS_ORDER_INITIAL = config?.STUDENT_FEEDBACK_QUESTIONS_ORDER_INITIAL
export const FEEDBACK_HIDDEN_STUDENT_COUNT = config?.FEEDBACK_HIDDEN_STUDENT_COUNT
export const OPEN_UNIVERSITY_ORG_ID = config?.OPEN_UNIVERSITY_ORG_ID
export const UNIVERSITY_ROOT_ID = config?.UNIVERSITY_ROOT_ID
export const UI_CONFIG_NAME = config?.UI_CONFIG_NAME
export const CUSTOM_FOOTER_COMPONENT = config?.CUSTOM_FOOTER_COMPONENT
export const CUSTOM_SESSION_PINGER = config?.CUSTOM_SESSION_PINGER
export const SUMMARY_COLORS = config?.SUMMARY_COLORS
export const SUMMARY_COLOR_SCALE_MIN = config?.SUMMARY_COLOR_SCALE_MIN
export const SUMMARY_COLOR_SCALE_MAX = config?.SUMMARY_COLOR_SCALE_MAX
export const UNIVERSITY_LEVEL_VIEWING_SPECIAL_GROUPS = config?.UNIVERSITY_LEVEL_VIEWING_SPECIAL_GROUPS
export const WORKLOAD_QUESTION_ID_ORDER = config?.WORKLOAD_QUESTION_ID_ORDER
export const ORGANISATION_SURVEYS_ENABLED = config?.ORGANISATION_SURVEYS_ENABLED
export const PUBLIC_COURSE_BROWSER_ENABLED = config?.PUBLIC_COURSE_BROWSER_ENABLED
export const ALWAYS_SHOW_STUDENT_LIST = config?.ALWAYS_SHOW_STUDENT_LIST
export const INTERIM_FEEDBACKS_ENABLED = config?.INTERIM_FEEDBACKS_ENABLED
export const SHOW_FEEDBACKS_TO_STUDENTS_ONLY_AFTER_ENDING = config?.SHOW_FEEDBACKS_TO_STUDENTS_ONLY_AFTER_ENDING
export const ENABLE_CORRESPONDENT_MANAGEMENT = config?.ENABLE_CORRESPONDENT_MANAGEMENT
export const ADD_LEADING_ZERO_TO_STUDENT_NUMBERS = config?.ADD_LEADING_ZERO_TO_STUDENT_NUMBERS
export const SHOW_COURSE_CODES_WITH_COURSE_NAMES = config?.SHOW_COURSE_CODES_WITH_COURSE_NAMES
export const SHOW_COURSES_TAB_IN_ORGANISATION_SETTINGS = config?.SHOW_COURSES_TAB_IN_ORGANISATION_SETTINGS
export const SHOW_CHIPS_AT_COURSE_UNIT_LEVEL_IN_ACCORDIONS = config?.SHOW_CHIPS_AT_COURSE_UNIT_LEVEL_IN_ACCORDIONS
export const SHOW_BUTTON_DOWNLOAD_SISU_CSV = config?.SHOW_BUTTON_DOWNLOAD_SISU_CSV

export const STUDY_YEAR_START_MONTH = 8 // September (0-indexed)
