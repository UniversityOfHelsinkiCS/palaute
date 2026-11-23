import type { ClientConfig } from '@common/clientConfig'

import norppaViskaali from '../assets/norppa_holy_smoke.png'
import stylizedNorppa from '../assets/stylized_norppa.png'
import toscalogoColor from '../assets/toscalogo_color.svg'
import toscalogoGrayscale from '../assets/toscalogo_grayscale.svg'

export const images = {
  toska_color: toscalogoColor,
  toska_grayscale: toscalogoGrayscale,
  norppa_viskaali: norppaViskaali,
  norppa_stylized: stylizedNorppa,
}

export const GIT_SHA = import.meta.env.REACT_APP_GIT_SHA || ''

export const inDevelopment = import.meta.env.DEV
export const inProduction = import.meta.env.PROD
export const inStaging = import.meta.env.REACT_APP_STAGING === 'true'
export const inE2EMode = import.meta.env.REACT_APP_E2E === 'true'

export const basePath = inDevelopment || inE2EMode ? '' : import.meta.env.BASE_PATH

// CONFIG is injected at build time by Vite. Read into a local variable to avoid
// duplicating the large object throughout the bundle when values are read multiple times.
const config = CONFIG as ClientConfig

export const INCLUDE_COURSES = config?.INCLUDE_COURSES
export const TAGS_ENABLED = config?.TAGS_ENABLED
export const FEEDBACK_REMINDER_COOLDOWN = config?.FEEDBACK_REMINDER_COOLDOWN
export const CONFIG_TEST_VALUE = config?.CONFIG_TEST_VALUE
export const SENTRY_DSN = config?.FRONTEND_SENTRY_DSN
export const GRAYLOG_URL = config?.GRAYLOG_URL
export const TRANSLATION_NAMESPACE = config?.TRANSLATION_NAMESPACE
export const LANGUAGES = config?.LANGUAGES ?? []
export const DEV_USERNAME = config?.DEV_USERNAME
export const STUDENT_FEEDBACK_QUESTIONS_ORDER_INITIAL = config?.STUDENT_FEEDBACK_QUESTIONS_ORDER_INITIAL
export const FEEDBACK_HIDDEN_STUDENT_COUNT = config?.FEEDBACK_HIDDEN_STUDENT_COUNT
export const OPEN_UNIVERSITY_ORG_ID = config?.OPEN_UNIVERSITY_ORG_ID
export const UNIVERSITY_ROOT_ID = config?.UNIVERSITY_ROOT_ID
export const UI_CONFIG_NAME = config?.UI_CONFIG_NAME
export const CUSTOM_FOOTER_COMPONENT = config?.CUSTOM_FOOTER_COMPONENT
export const CUSTOM_SESSION_PINGER = config?.CUSTOM_SESSION_PINGER
export const SUMMARY_COLORS = config?.SUMMARY_COLORS ?? []
export const SUMMARY_COLOR_SCALE_MIN = config?.SUMMARY_COLOR_SCALE_MIN
export const SUMMARY_COLOR_SCALE_MAX = config?.SUMMARY_COLOR_SCALE_MAX
export const UNIVERSITY_LEVEL_VIEWING_SPECIAL_GROUPS = config?.UNIVERSITY_LEVEL_VIEWING_SPECIAL_GROUPS ?? []
export const WORKLOAD_QUESTION_ID = config?.WORKLOAD_QUESTION_ID
export const WORKLOAD_QUESTION_ID_ORDER = config?.WORKLOAD_QUESTION_ID_ORDER ?? []
export const ORGANISATION_SURVEYS_ENABLED = config?.ORGANISATION_SURVEYS_ENABLED
export const PUBLIC_COURSE_BROWSER_ENABLED = config?.PUBLIC_COURSE_BROWSER_ENABLED
export const HELP_CHATBOT_ENABLED = config?.HELP_CHATBOT_ENABLED === true
export const USER_GUIDE_ENABLED = config?.USER_GUIDE_ENABLED === true
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
