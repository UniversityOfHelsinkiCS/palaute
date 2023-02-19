/**
 * These are the default config values, and may be overridden by subsequent config files.
 * Use NODE_CONFIG_ENV to select a config file.
 * See hy.js for more usage examples.
 * ---
 * The config object is JSON.stringified and populated for frontend AT BUILD TIME.
 * One should only use simple POJOs here.
 * Dates for example should be parsed elsewhere from a string defined here.
 */
const config = {
  /**
   * Usernames of admin
   */
  ADMINS: [],

  /**
   * These courses bypass the starting after 1.9 filter.
   * Work in progress
   */
  INCLUDE_COURSES: [],

  /**
   * Enables the feature for these organisations.
   * Feature allows to select whether feedback targets related to a course code
   * can see the list of students who have given feedback.
   * Normally it is either on or off for all courses of organisation.
   */
  STUDENT_LIST_BY_COURSE_ENABLED: [],

  /**
   * Enables tags for these organisations
   */
  TAGS_ENABLED: [],

  /**
   * The id of a LIKERT-type question that is considered the university level workload question.
   * Future ideas: get rid of this and add a new question type for it instead.
   */
  WORKLOAD_QUESTION_ID: 1042,

  /**
   * How long JWT tokens in noad links last
   */
  NOAD_LINK_EXPIRATION_DAYS: 14,

  /**
   * How many objects fit in LRU cache
   * Set to zero to disable fbt caching
   */
  FEEDBACK_TARGET_CACHE_SIZE: 250,

  /**
   * For cur's before this date, TEACHER role is also considered RESPONSIBLE_TEACHER
   */
  RESPONSIBLE_TEACHERS_SPLIT_DATE: '2020-01-01',

  /**
   * How many days before feedbackTarget opening to send a reminder to responsible teachers
   */
  TEACHER_REMINDER_DAYS_TO_OPEN: 7,

  /**
   * How many days before closing to send an automatic reminder to students who have not given feedback.
   * This feature is currently only enabled for courses with STUDENT_LIST_BY_COURSE_ENABLED enabled
   * (only configured organisations can do this)
   */
  STUDENT_REMINDER_DAYS_TO_CLOSE: 3,

  /**
   * How often (hours) can teacher send manual reminder email
   * (automatic reminder is also considered for cooldown)
   */
  FEEDBACK_REMINDER_COOLDOWN: 24,

  /**
   * This is a test, e2e tests may check its value
   */
  CONFIG_TEST_VALUE: 'Minttujam',

  /**
   * Can be used to check which config is in use
   */
  CONFIG_NAME: 'Default',

  /**
   * Dsn for Sentry reporting client
   */
  SENTRY_DSN: '',

  /**
   * Pate (mail service) url
   */
  PATE_URL: '',

  /**
   * JAMI (iam rights service) url
   */
  JAMI_URL: '',

  /**
   * The public url of the app, to be used for example in email links.
   * Why is it defined here in addition to the normal build argument? I don't trust it's given to the server properly.
   * Might not be required once mails are extracted away from server
   */
  PUBLIC_URL: 'https://coursefeedback.helsinki.fi/',

  /**
   * Admin interface has link to our graylog to check updater logs
   */
  GRAYLOG_URL: '',

  /**
   * The translation file to use (i18n is set to always fallback to 'translation')
   */
  TRANSLATION_NAMESPACE: 'translation',

  /**
   * The user that is used in development mode, when we dont have shibboleth. Must be one of the ADMINS.
   */
  DEV_USERNAME: 'mluukkai',
}

module.exports = config
