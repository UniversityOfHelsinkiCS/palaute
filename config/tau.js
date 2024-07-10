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
   * Workload question id order. Needed to map the single choice question to a number.
   * The order is:
   * [too heavy, somewhat too heavy, appropriate, somewhat too light, too light]
   * HY ref:[too much, much, just right, little, too little]
   */
  WORKLOAD_QUESTION_ID_ORDER: [
    '98f27153-73cf-4cc1-86f9-223a61aea325',
    '919b3cbd-3be6-4de9-b337-9e0080144440',
    '54b31110-5e16-4d8d-b02d-b8a3e4add24e',
    '84b6ffdf-40a9-41d8-a411-1a0ab2993262',
    '11559e75-3a6e-47a7-a979-991879c10469',
  ],

  /**
   * How long JWT tokens in noad links last
   */
  NOAD_LINK_EXPIRATION_DAYS: 0,

  /**
   * How many fbts fit in LRU cache
   */
  FEEDBACK_TARGET_CACHE_SIZE: 250,

  /**
   * Optional TTL in ms for fbt cache. Small number effectively disables caching.
   * Disabling will slow down requests related to feedback target view.
   * Do not set if you don't want cache to do TTL checks.
   */
  //10 minutes time to live
  FEEDBACK_TARGET_CACHE_TTL: 30000,

  //1 hour time to live
  USER_CACHE_TTL: 360000,

  /**
   * For cur's before this date, TEACHER role is also considered RESPONSIBLE_TEACHER
   */
  RESPONSIBLE_TEACHERS_SPLIT_DATE: '2020-01-01',

  /**
   * How many enrolled students are needed for feedback to be shown.
   * Used to protect anonymity of students in small courses.
   * e.g. one feedback given in a course with only one student.
   * When set to zero, feedback is always shown.
   * */
  FEEDBACK_HIDDEN_STUDENT_COUNT: 0,

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
  PATE_URL: 'http://pate:3473',

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

  /**
   * Supported languages. Add translations for each language. Defaults are 'fi' ,'sv' and 'en'
   */
  LANGUAGES: ['fi', 'en'],

  /**
   * The user that is used in development mode, when we dont have shibboleth. Must be one of the ADMINS.
   */
  DEV_USERNAME: 'admin',

  /**
   * Id of the university root organisation (for example Helsingin Yliopisto).
   */
  UNIVERSITY_ROOT_ID: 'tuni-university-root-id',

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
   * These orgs are "skipped" in the summary organisation tree, meaning that instead their child organisations are displayed directly under their parent.
   */
  SUMMARY_SKIP_ORG_IDS: [],

  /**
   * "Feedback response given" indicator in summary is given to targets where response is written AND email about response is sent.
   * Email-field however didn't exist always, so this config value is needed. Targets whose course ended before this date get the "given" indicator
   * if the response is written even if the "email sent" field is false.
   */
  FEEDBACK_RESPONSE_EMAILS_SINCE_DATE: '2022-01-01',

  SEND_AUTOMATIC_REMINDER_ALWAYS: true,

  PRIVATE_TEST: 'TAU_PRIVATE_TEST',

  /**
   * Keys defined here are filtered away from frontend config during build process.
   */
  PRIVATE_KEYS: ['JAMI_URL', 'PATE_URL', 'PRIVATE_TEST'],

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
  STUDENT_FEEDBACK_SHOW_REALISATION_NAME: false,

  STUDENT_FEEDBACK_QUESTIONS_ORDER_INITIAL: true,

  UI_CONFIG_NAME: 'tau-ui',

  CUSTOM_FOOTER_COMPONENT: 'Footer-tau',

  /**
   * Allow organisation admins to create custom surveys
   */
  ORGANISATION_SURVEYS_ENABLED: true,

  INTERIM_FEEDBACKS_ENABLED: true,

  /**
   * Alway show list of students in feedback target view
   * value: false = Only show list of students when studentListVisible is set at course or organisation level
   * value: true  = Always show list of students, hide feedback given status if studentListVisible is not set
   */
  ALWAYS_SHOW_STUDENT_LIST: false,

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

  /**
   * In case a user tries to access Norppa without having his user information in users table, this value is used instead of uid header to fetch user information from the database.
   * This avoids endless failing loading of Norppa front page.
   */
  NO_USER_USERNAME: 'nonorppauser',

  /**
   * The special groups which can view the whole university level organisation tree. Given to users by Jami.
   * One should maybe have only one such group, and abstract the bulk of the access logic to Jami.
   */
  UNIVERSITY_LEVEL_VIEWING_SPECIAL_GROUPS: ['allProgrammes'],

  /**
   * Enabling the new version of Teaching / Opetukseni / Kyselyni -view
   */
  NEW_TEACHING_VIEW_ENABLED: true,

  /**
   * TAU wants to show feedbacks to students only after the feedback target has ended
   */
  SHOW_FEEDBACKS_TO_STUDENTS_ONLY_AFTER_ENDING: true,

  /**
   * Feedback correspondents can be added and removed in norppa (organisation settings).
   * This setting enables/disables this feature.
   */
  ENABLE_CORRESPONDENT_MANAGEMENT: false,

  /**
   * TAU does not want to have the courses tab visible in organisation settings
   */
  SHOW_COURSES_TAB_IN_ORGANISATION_SETTINGS: false,
}

module.exports = config
