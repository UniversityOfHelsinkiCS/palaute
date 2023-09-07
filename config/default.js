/**
 * These are the default config values, and may be overridden by subsequent config files.
 * Use NODE_CONFIG_ENV to select a config file.
 * See hy.js for more usage examples.
 * ---
 * The config object is JSON.stringified and populated for frontend AT BUILD TIME.
 * One should only use simple POJOs here.
 * Dates for example should be parsed elsewhere from a date string defined here.
 */
const config = {
  /**
   * Usernames of admin in development mode
   */
  DEV_ADMINS: [],

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
   * The id of a SINGLE_CHOICE-type question that is considered the university level workload question.
   * The workload question has some assumptions about it, mainly that it MUST NOT have a "no answer (EOS)"-option.
   * Future ideas: get rid of this and add a new question type for it instead.
   */
  WORKLOAD_QUESTION_ID: 1042,

  /**
   * Workload question id order. Needed to map the single choice question to a number.
   * The HY question values are there for reference.
   * The order is: [too much, much, just right, little, too little]
   */
  WORKLOAD_QUESTION_ID_ORDER: [
    'c5ecf5aa-76cc-4ded-985c-8cbd091a4a95',
    '2ea2b421-5c85-47cd-9008-1acc008e009f',
    'e35a20ca-8e0e-4c44-8c26-6a197be3d422',
    'b2dab0a2-4139-4dfc-949c-fdca744495c2',
    'ae8bccc7-1c4f-4f22-9c4c-2879d4e123d5',
  ],

  /**
   * How long JWT tokens in noad links last
   */
  NOAD_LINK_EXPIRATION_DAYS: 14,

  /**
   * How many fbts fit in LRU cache
   */
  FEEDBACK_TARGET_CACHE_SIZE: 250,

  /**
   * Optional TTL in ms for fbt cache. Small number effectively disables caching.
   * Disabling will slow down requests related to feedback target view.
   * Do not set if you don't want cache to do TTL checks.
   */
  FEEDBACK_TARGET_CACHE_TTL: undefined,

  /**
   * How many users fit in LRU cache
   */
  USER_CACHE_SIZE: 250,

  /**
   * Optional TTL in ms for user cache. Small number effectively disables caching.
   * Disabling can sometimes be helpful for development but it will slow down every request and cause a lot of Jami calls.
   * Do not set if you don't want cache to do TTL checks.
   */
  USER_CACHE_TTL: undefined,

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
  PUBLIC_URL: 'https://norppa.helsinki.fi/',

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

  /**
   * HY has some special cases for open university courses, especially how they are handled in summary stats. Should work when this id matches nothing.
   */
  OPEN_UNIVERSITY_ORG_ID: '',

  /**
   * These orgs are explicitely excluded from summary statistics,
   * for example to workaround a universitys Sisu abuse that would cause weird organisations to appear in summary.
   */
  SUMMARY_EXCLUDED_ORG_IDS: [],

  /**
   * "Feedback response given" indicator in summary is given to targets where response is written AND email about response is sent.
   * Email-field however didn't exist always, so this config value is needed. Targets whose course ended before this date get the "given" indicator
   * if the response is written even if the "email sent" field is false.
   */
  FEEDBACK_RESPONSE_EMAILS_SINCE_DATE: '2022-01-01',

  /**
   * Keys defined here are filtered away from frontend config during build process.
   */
  PRIVATE_KEYS: ['JAMI_URL', 'PATE_URL'],

  /**
   * Iam groups header name
   */
  IAM_GROUPS_HEADER: 'hygroupcn',

  /**
   * Transport logs to separate graylog server
   */
  GELF_TRANSPORT_ENABLED: false,

  /**
   * The course summary color scale used in summary views and fbt results view for LIKERT type values ranging from 1-5. (LIKERT options minimum is 1 so below 1 means no data)
   * First color in the scale is for NO DATA.
   * Second color is for everything below MIN, eg. the 'worst' color.
   * Similarly, last color is for everything above MAX, eg. the 'best' color.
   * In between, the colors are in equal sized steps.
   * Support for multiple color scales (such as more accessible ones) is in idea stage.
   */
  SUMMARY_COLORS: [
    '#d5d6f0',
    '#c9586f',
    '#e66067',
    '#f57368',
    '#fb8c6e',
    '#fba678',
    '#dbda7d',
    '#9ec27c',
    '#60a866',
    '#008c59',
  ],

  /**
   * The value below which the 'worst' color is used. Increase/decrease to make bad values more/less visible.
   */
  SUMMARY_COLOR_SCALE_MIN: 2.5,

  /**
   * The value above which the 'best' color is used. The idea is that above MAX, the value is already considered 'perfect' and no hue change is needed.
   * Make sure it's fit to your data, eg. if a lot of values are above 4.5 you might want to increase it and vice versa.
   */
  SUMMARY_COLOR_SCALE_MAX: 4.5,
}

module.exports = config
