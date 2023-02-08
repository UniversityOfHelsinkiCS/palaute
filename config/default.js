/**
 * These are the default config values, and may be overridden by subsequent config files.
 * Use NODE_CONFIG_ENV to select a config file.
 * See hy.js for more usage examples.
 * ---
 * The config object is JSON.stringified and polyfilled for frontend AT BUILD TIME.
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
   * Before this date, teacher role url is also considered responsible_teacher
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
}

module.exports = config
