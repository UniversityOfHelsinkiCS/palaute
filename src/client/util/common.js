/**
 * Insert common items here
 */
import toscalogoColor from '../assets/toscalogo_color.svg'
import toscalogoGrayscale from '../assets/toscalogo_grayscale.svg'
import norppaViskaali from '../assets/norppa_holy_smoke.png'

export const images = {
  toska_color: toscalogoColor,
  toska_grayscale: toscalogoGrayscale,
  norppa_viskaali: norppaViskaali,
}

export const colors = {}

export const basePath = process.env.PUBLIC_URL || ''

export const GIT_SHA = process.env.REACT_APP_GIT_SHA || ''

export const inProduction = process.env.NODE_ENV === 'production'
export const inStaging = process.env.REACT_APP_STAGING === 'true'
export const inE2EMode = process.env.REACT_APP_E2E === 'true'

// CONFIG is populated by webpack defineplugin.

// eslint-disable-next-line no-undef
export const INCLUDE_COURSES = CONFIG?.INCLUDE_COURSES ?? []

// eslint-disable-next-line no-undef
export const TAGS_ENABLED = CONFIG?.TAGS_ENABLED ?? []

// eslint-disable-next-line no-undef
export const FEEDBACK_REMINDER_COOLDOWN = CONFIG?.FEEDBACK_REMINDER_COOLDOWN

// eslint-disable-next-line no-undef
export const CONFIG_TEST_VALUE = CONFIG?.CONFIG_TEST_VALUE

// eslint-disable-next-line no-undef
export const CONFIG_NAME = CONFIG?.CONFIG_NAME

// eslint-disable-next-line no-undef
export const SENTRY_DSN = CONFIG?.SENTRY_DSN

// eslint-disable-next-line no-undef
export const GRAYLOG_URL = CONFIG?.GRAYLOG_URL

// eslint-disable-next-line no-undef
export const TRANSLATION_NAMESPACE = CONFIG?.TRANSLATION_NAMESPACE

// eslint-disable-next-line no-undef
export const LANGUAGES = CONFIG?.LANGUAGES

// eslint-disable-next-line no-undef
export const DEV_USERNAME = CONFIG?.DEV_USERNAME

// eslint-disable-next-line no-undef
export const PRIVATE_TEST = CONFIG?.PRIVATE_TEST // This is expected to be undefined in e2e tests

// eslint-disable-next-line no-undef
export const STUDENT_FEEDBACK_SHOW_REALISATION_NAME = CONFIG?.STUDENT_FEEDBACK_SHOW_REALISATION_NAME

// eslint-disable-next-line no-undef
export const STUDENT_FEEDBACK_QUESTIONS_ORDER_INITIAL = CONFIG?.STUDENT_FEEDBACK_QUESTIONS_ORDER_INITIAL

// eslint-disable-next-line no-undef
export const FEEDBACK_HIDDEN_STUDENT_COUNT = CONFIG?.FEEDBACK_HIDDEN_STUDENT_COUNT

// eslint-disable-next-line no-undef
export const OPEN_UNIVERSITY_ORG_ID = CONFIG?.OPEN_UNIVERSITY_ORG_ID

// eslint-disable-next-line no-undef
export const UNIVERSITY_ROOT_ID = CONFIG?.UNIVERSITY_ROOT_ID

// eslint-disable-next-line no-undef
export const SUMMARY_COLORS = CONFIG?.SUMMARY_COLORS

// eslint-disable-next-line no-undef
export const SUMMARY_COLOR_SCALE_MIN = CONFIG?.SUMMARY_COLOR_SCALE_MIN

// eslint-disable-next-line no-undef
export const SUMMARY_COLOR_SCALE_MAX = CONFIG?.SUMMARY_COLOR_SCALE_MAX

// eslint-disable-next-line no-undef
export const UNIVERSITY_LEVEL_VIEWING_SPECIAL_GROUPS = CONFIG?.UNIVERSITY_LEVEL_VIEWING_SPECIAL_GROUPS ?? []

// eslint-disable-next-line no-undef
export const WORKLOAD_QUESTION_ID_ORDER = CONFIG?.WORKLOAD_QUESTION_ID_ORDER ?? []

// eslint-disable-next-line no-undef
export const USE_ROLE_BASED_COURSE_LINKS = CONFIG?.USE_ROLE_BASED_COURSE_LINKS

// eslint-disable-next-line no-undef
export const ORGANISATION_SURVEYS_ENABLED = CONFIG?.ORGANISATION_SURVEYS_ENABLED

// eslint-disable-next-line no-undef
export const ALWAYS_SHOW_STUDENT_LIST = CONFIG?.ALWAYS_SHOW_STUDENT_LIST

// eslint-disable-next-line no-undef
export const INTERIM_FEEDBACKS_ENABLED = CONFIG?.INTERIM_FEEDBACKS_ENABLED

export const STUDY_YEAR_START_MONTH = 8 // September
