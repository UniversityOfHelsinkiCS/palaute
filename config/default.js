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
   * The id of a LIKERT-type question that is considered the university level workload question.
   * Future ideas: get rid of this and add a new question type for it instead.
   */
  WORKLOAD_QUESTION_ID: 1042,

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
   * Supported languages. Add translations for each language. Defaults are 'fi' ,'sv' and 'en'
   */
  LANGUAGES: ['fi', 'sv', 'en'],

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
   * Controls course realisation name visibility on feedback page for students
   */
  STUDENT_FEEDBACK_SHOW_REALISATION_NAME: true,

  /*
    STUDENT_FEEDBACK_QUESTIONS_ORDER_INITIAL controls order of questions for student (and preview)
    value: false = HY Mode (university and programme questions with type OPEN are last)
      1. grouping questions
      2. university questions (except questions with type OPEN)
      3. programme questions (except questions with type OPEN)
      4. feedbacktarget questions (teacher's questions)
      5. programme questions with type OPEN
      6. university questions with type OPEN

    value: true = Same order as in edit view (initial order, only grouping questions are first)
      1. grouping questions
      2. university questions
      3. programme questions
      4. feedbacktarget questions (teacher's questions)
  */

  STUDENT_FEEDBACK_QUESTIONS_ORDER_INITIAL: false,

  /**
   * A custom theme namespace to use. A custom theme config file with the same name should be located under src/client/themes/<CUSTOM_THEME_NAMESPACE>.js.
   * For example CUSTOM_THEME_NAMESPACE is set as 'custom' and then a custom theme file named custom.js is added into src/client/themes/ - folder.
   * The file is a JavaScript file that returns a function that returns Material UI theme options object.
   * Function description: (Mode: light | dark) => ThemeOptions
   * The existing theme in src/client/theme.js can be used as an example
   * More info about theming: https://mui.com/material-ui/customization/theming/
   */
  CUSTOM_THEME_NAMESPACE: undefined,
}

module.exports = config
