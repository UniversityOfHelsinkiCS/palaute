/**
 * This config used by HY is loaded when NODE_CONFIG_ENV=hy
 */
const config = {
  ADMINS: ['admin'],

  /**
   * These courses bypass the starting after 1.9 filter.
   * Work in progress
   */
  INCLUDE_COURSES: [],

  /**
   * Enabled for SOS
   */
  STUDENT_LIST_BY_COURSE_ENABLED: [],

  /**
   * Tags enabled for kasvis
   */
  TAGS_ENABLED: [],

  /**
   * The id of a LIKERT-type question that is considered the university level workload question.
   * Future ideas: get rid of this and add a new question type for it instead.
   */
  WORKLOAD_QUESTION_ID: 1042,

  NOAD_LINK_EXPIRATION_DAYS: 14,

  FEEDBACK_TARGET_CACHE_SIZE: 250,

  RESPONSIBLE_TEACHERS_SPLIT_DATE: '2023-01-01',

  TEACHER_REMINDER_DAYS_TO_OPEN: 7,

  STUDENT_REMINDER_DAYS_TO_CLOSE: 3,

  FEEDBACK_REMINDER_COOLDOWN: 24,

  CONFIG_TEST_VALUE: 'HY-Minttujam',

  CONFIG_NAME: 'TAU',

  SENTRY_DSN: 'https://8877ea30aa714216b27b22c8aa395723@sentry.cs.helsinki.fi/6',

  PATE_URL: 'https://importer.cs.helsinki.fi/api/pate',

  JAMI_URL: 'https://importer.cs.helsinki.fi/api/auth',

  PUBLIC_URL: 'https://coursefeedback.helsinki.fi',

  GRAYLOG_URL: 'https://graylog.toska.cs.helsinki.fi',

  TRANSLATION_NAMESPACE: 'tau',

  DEV_USERNAME: 'admin',

  OPEN_UNIVERSITY_ORG_ID: 'hy-org-48645785',

  SUMMARY_EXCLUDED_ORG_IDS: ['hy-org-48901898', 'hy-org-48902017'],

  FEEDBACK_RESPONSE_EMAILS_SINCE_DATE: '2022-01-01',
}

module.exports = config
