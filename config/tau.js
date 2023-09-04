/**
 * This config used by HY is loaded when NODE_CONFIG_ENV=hy
 */
const config = {
  DEV_ADMINS: ['admin'],

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
  STUDENT_LIST_BY_COURSE_ENABLED: [
    'tuni-1301000198',
    'tuni-1301000204',
    'tuni-1301000006',
    'tuni-1301000036',
    'tuni-1301000005',
    'tuni-1301000008',
    'tuni-1301000549',
    'tuni-1301000196',
    'tuni-1301000023',
    'tuni-1301000013',
    'tuni-1301000003',
    'tuni-1301000024',
    'tuni-1301000200',
    'tuni-1301000009',
    'tuni-1301000026',
    'tuni-1301000034',
    'tuni-1301000202',
    'tuni-1301000035',
    'tuni-1301000010',
    'tuni-1301000194',
    'tuni-1301000028',
    'TKOUL',
    'tuni-1301000015',
    'tuni-1301000058',
    'tuni-1301000029',
    'tuni-1301000017',
    'tuni-1301000018',
    'tuni-1301000602',
    'tuni-1301000033',
    'tuni-1301000022',
    'tuni-1301000059',
    'tuni-1301000060',
    'tuni-1301000031',
    'TUNI',
    'tuni-1301000206',
    'tuni-1301000057',
    'tuni-1301000004',
    'tuni-1301000016',
    'tuni-1301000077',
    'tuni-1301000030',
    'tuni-1301000012',
    'tuni-1301000021',
    'tuni-1301000011',
    'tuni-1301000002',
  ],

  /**
   * Enables tags for these organisations
   */
  TAGS_ENABLED: [],

  /**
   * The id of a LIKERT-type question that is considered the university level workload question.
   * Future ideas: get rid of this and add a new question type for it instead.
   */
  WORKLOAD_QUESTION_ID: 90,

  /**
   * How long JWT tokens in noad links last
   */
  NOAD_LINK_EXPIRATION_DAYS: 0,

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
  CONFIG_TEST_VALUE: 'TAU_CONFIG_TEST_VALUE',

  /**
   * Can be used to check which config is in use
   */
  CONFIG_NAME: 'TAU',

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
  JAMI_URL: 'http://jami:3001',

  /**
   * The public url of the app, to be used for example in email links.
   * Why is it defined here in addition to the normal build argument? I don't trust it's given to the server properly.
   * Might not be required once mails are extracted away from server
   */
  PUBLIC_URL: 'https://norppa.tuni.fi',

  /**
   * Admin interface has link to our graylog to check updater logs
   */
  GRAYLOG_URL: '',

  /**
   * The translation file to use (i18n is set to always fallback to 'translation')
   */
  TRANSLATION_NAMESPACE: 'tau',

  //10 minutes time to live
  FEEDBACK_TARGET_CACHE_TTL: 30000,

  //1 hour time to live
  USER_CACHE_TTL: 360000,

  /**
   * Supported languages. Add translations for each language. Defaults are 'fi' ,'sv' and 'en'
   */
  LANGUAGES: ['fi', 'en'],

  /**
   * The user that is used in development mode, when we dont have shibboleth. Must be one of the ADMINS.
   */
  DEV_USERNAME: 'admin',

  /**
   * HY has some special cases for open university courses, especially how they are handled in summary stats. Should work when this id matches nothing.
   */
  OPEN_UNIVERSITY_ORG_ID: '',

  /**
   * These orgs are explicitely excluded from summary statistics,
   * for example to workaround a universitys Sisu abuse that would cause weird organisations to appear in summary.
   */
  SUMMARY_EXCLUDED_ORG_IDS: [''],

  /**
   * "Feedback response given" indicator in summary is given to targets where response is written AND email about response is sent.
   * Email-field however didn't exist always, so this config value is needed. Targets whose course ended before this date get the "given" indicator
   * if the response is written even if the "email sent" field is false.
   */
  FEEDBACK_RESPONSE_EMAILS_SINCE_DATE: '2022-01-01',

  PRIVATE_TEST: 'TAU_PRIVATE_TEST',

  /**
   * Keys defined here are filtered away from frontend config during build process.
   */
  PRIVATE_KEYS: ['JAMI_URL', 'PATE_URL', 'PRIVATE_TEST'],

  /**
   * Controls course realisation name visibility on feedback page for students
   */
  STUDENT_FEEDBACK_SHOW_REALISATION_NAME: false,

  STUDENT_FEEDBACK_QUESTIONS_ORDER_INITIAL: true,
}

module.exports = config
