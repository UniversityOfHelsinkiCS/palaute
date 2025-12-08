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
    'ae8bccc7-1c4f-4f22-9c4c-2879d4e123d5',
    'b2dab0a2-4139-4dfc-949c-fdca744495c2',
    'e35a20ca-8e0e-4c44-8c26-6a197be3d422',
    '2ea2b421-5c85-47cd-9008-1acc008e009f',
    'c5ecf5aa-76cc-4ded-985c-8cbd091a4a95',
  ],

  /**
   * How long JWT tokens in noad links last
   */
  NOAD_LINK_EXPIRATION_DAYS: 14,

  /**
   * Optional TTL in ms for fbt cache. Small number effectively disables caching.
   * Disabling will slow down requests related to feedback target view.
   * Do not set if you don't want cache to do TTL checks.
   */
  FEEDBACK_TARGET_CACHE_TTL: undefined,

  /**
   * Optional TTL in ms for user cache. Small number effectively disables caching.
   * Disabling can sometimes be helpful for development but it will slow down every request and cause a lot of Jami calls.
   * Do not set if you don't want cache to do TTL checks.
   */
  USER_CACHE_TTL: undefined,

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
   * Enable/disable sending automatic reminders to students before feedback period ends
   * See also settings STUDENT_REMINDER_DAYS_TO_CLOSE and FEEDBACK_REMINDER_COOLDOWN
   */
  SEND_STUDENT_AUTOMATIC_REMINDER_ENABLED: false,

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
  FRONTEND_SENTRY_DSN: '',

  /**
   * Dsn for Sentry reporting client
   */
  BACKEND_SENTRY_DSN: '',

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
   * UPDATE 7.5.2024: This is pretty much true that this is used for the mailing
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
   * Supported languages. Add translations for each language. Defaults are 'fi' ,'sv' and 'en'
   */
  LANGUAGES: ['fi', 'sv', 'en'],

  /**
   * The user that is used in development mode, when we dont have shibboleth. Must be one of the ADMINS.
   */
  DEV_USERNAME: 'mluukkai',

  /**
   * Id of the university root organisation (for example Helsingin Yliopisto).
   */
  UNIVERSITY_ROOT_ID: 'hy-university-root-id',

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
   * These orgs are "skipped" in the summary organisation tree, meaning that instead their child organisations are displayed directly under their parent.
   */
  SUMMARY_SKIP_ORG_IDS: [],

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
   * Custom config file to use. A custom UI config file with the same name should be located under src/client/config/<UI_CONFIG_NAME>.js.
   * For example, UI_CONFIG_NAME is first set as 'tau-ui' and then a custom theme file named tau-ui.js is added into the src/client/config/ - folder.
   * The file is a JavaScript file that returns images, styles, and theme properties.
   * - images property returns an object with different image URLs to be replaced (currently, only logo image override is available).
   *   The most convenient way is to add the image into assets, import it to the config file and use that reference as the image URL.
   * - styles property returns an object with different component style overrides in js-format (currently, only logo styles overrides are available)
   * - theme property returns a function that returns a Material UI theme options object
   *   Function description: (Mode: light | dark) => ThemeOptions
   *   The existing theme in src/client/theme.js can be used as an example
   *   More info about theming: https://mui.com/material-ui/customization/theming/
   */
  UI_CONFIG_NAME: null,

  /**
   * Custom footer component to use. Footer-default is HY original footer. If university would like to use
   * its own footer, a new footer component should be created in src/client/components and folder name of that
   * component should be set here.
   */
  CUSTOM_FOOTER_COMPONENT: 'Footer-default',

  /**
   * Allow organisation admins to create custom surveys
   */
  ORGANISATION_SURVEYS_ENABLED: false,

  /**
   * Whether the public course browser feature is enabled.
   * This feature allows ANY user to browse the courses and their public information
   * Whether the public course browser feature is enabled.
   * This feature allows ANY user to browse the courses and their public information
   * (CUR and CU names, code and dates) by organisation.
   * Setting this to true enables both the frontend route and the backend api endpoints for the feature.
   */
  PUBLIC_COURSE_BROWSER_ENABLED: false,

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
  NO_USER_USERNAME: null,

  /**
   * The special groups which can view the whole university level organisation tree. Given to users by Jami.
   * One should maybe have only one such group, and abstract the bulk of the access logic to Jami.
   */
  UNIVERSITY_LEVEL_VIEWING_SPECIAL_GROUPS: [],

  /**
   * Feedback correspondent special group.
   */
  FEEDBACK_CORRESPONDENT_SPECIAL_GROUP: '',

  /**
   * If this is set to true students can only see feedback target's feedbacks after the feedback target has
   * closed (its closes_at date is in the past).
   */
  SHOW_FEEDBACKS_TO_STUDENTS_ONLY_AFTER_ENDING: false,

  /**
   * Feedback correspondents can be added and removed in norppa (organisation settings).
   * This setting enables/disables this feature.
   */
  ENABLE_CORRESPONDENT_MANAGEMENT: true,

  /**
   * Student numbers copied from excel sometimes lose their leading zeros. Norppa can
   * try to fix this automatically. Currently in use only in OrganisationSurveyEditor.
   */
  ADD_LEADING_ZERO_TO_STUDENT_NUMBERS: true,

  /**
   * This controls if course codes are added in front of course names in both
   * Norppa's UI and in the emails it sends. Notice that {{ courseCode }} needs
   * to be added in the translation json files if course codes are needed in
   * emails.
   */
  SHOW_COURSE_CODES_WITH_COURSE_NAMES: false,

  /**
   * Controls visibility of the courses tab in organisation settings
   */
  SHOW_COURSES_TAB_IN_ORGANISATION_SETTINGS: true,

  /**
   * Controls showing of chips at course unit level based on the chips of its feedback targets
   */
  SHOW_CHIPS_AT_COURSE_UNIT_LEVEL_IN_ACCORDIONS: false,

  /**
   * Custom session pinger hook to use. The pinger is used to check if the login session is still valid.
   * The pinger hooks reside in src/client/hooks/pinger direcotry. The default pinger is 'Pinger-default'
   * and any custom pingers should have a Prefix 'Pinger-'. Such as 'Pinger-OICD', 'Pinger-shibboleth', etc.
   */
  CUSTOM_SESSION_PINGER: 'Pinger-default',

  /*Controls showing the button for downloading Sisu CSV in the feedbacktarget view - Students tab
   * if set to true, download button will be shown to feedbacktargets which has courserealisation named 'Palaute' (finnish)
   * which means that feedbacktarget is created based on Sisu courserealisation which gathers 'feedback given' -information to Sisu.
   * Courserealisation / assessmentitem must approve grade hyväksytty/hylätty and credits 0
   * */
  SHOW_BUTTON_DOWNLOAD_SISU_CSV: false,

  /**
   * Survey opening emails, maximum amount of emails to be sent for pate per request. If value = 0, then send all emails
   */
  SURVEY_OPENING_EMAILS_CHUNK_MAX_SIZE: 0,
}

module.exports = config
