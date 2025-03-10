/**
 * This config used by HY is loaded when NODE_CONFIG_ENV=hy
 */
const config = {
  DEV_ADMINS: ['mluukkai'],

  /**
   * These courses bypass the starting after 1.9 filter.
   * Work in progress
   */
  INCLUDE_COURSES: [
    'hy-opt-cur-2122-9f78b627-6261-4eb9-91c4-426066b56cef', // MED-200
    'hy-opt-cur-2122-329bfeb5-2c56-450f-b3f5-ff9dbcca8932',
    'hy-CUR-142630573',
    'hy-CUR-135891626', // Avoin ohtu
    'hy-opt-cur-2021-28bce92e-aa01-4be8-832a-ca9df39bbd39', // Ohte
    'hy-CUR-142676412', // Tsoha loppukesä
    'hy-opt-cur-2122-4de68e21-0a84-4888-b7b6-754179c2832f', // MED-31
    'hy-CUR-137486438', // Functional programming I
    'hy-CUR-137486330', // Ohjelmointihaasteita
    'hy-opt-cur-2122-b00d8962-2fef-4452-ac0e-8d4e98113c16', // ELL-101,
    'otm-734c4e41-1e8e-427e-9719-e429a7d67326', // Mail mayhem
    'hy-opt-cur-2122-620d7b5e-9e79-4e06-8536-0abb89dcd9cc',
    'hy-CUR-143272788',
    'otm-fb6961f6-f2da-41ef-bb46-5f44a4beba0f',
    'otm-86582366-ef18-41ed-843c-373f7403ae36',
    'otm-cf67095d-cd2b-4867-8674-c0ec2f880dbd',
    'hy-CUR-143015278',
    'otm-c388c9fd-ab9d-4729-a72d-5b50bee092a5',
    'hy-opt-cur-2122-b0d7ae29-aa6d-434b-a814-918fe313d751',
    'hy-CUR-140926147',
    'hy-CUR-142575636',
    'hy-opt-cur-2122-25da8b39-8fc5-4a6d-bbe6-4674e95515bd',
    'hy-opt-cur-2122-8823ab4f-6ac2-4cce-a73e-363ca5fc8c07',
    'hy-CUR-143053416',
    'otm-f55336a1-66f3-4f20-99e8-d7fe5aae69f2',
    'hy-opt-cur-2122-45d583e2-f4a2-48ca-841b-572c7627626f',
    'hy-CUR-143052783',
    'hy-CUR-143003149',
    'otm-d0e87b45-88ba-48b7-a57e-34fc36083ea8',
    'hy-CUR-142257880',
    'hy-CUR-141643798',
    'hy-CUR-142630573',
    'hy-CUR-142441501',
    'hy-opt-cur-2021-7f93a0cf-c849-4280-aeef-3ee2b9bb01fc',
    'hy-CUR-142418452',
    'hy-opt-cur-2122-78220cb5-1bad-4b19-88c3-d4d6a45c8a42',
    'hy-CUR-142475480',
    'hy-CUR-142474123',
    'hy-CUR-142485879',
    'hy-CUR-139544848',
    'hy-CUR-140923542',
    'otm-282e2f19-9068-415f-83ef-04d764d7c4e0',
    'hy-CUR-142448538',
    'hy-CUR-142257312',
    'otm-13e738a9-357b-4140-9a03-489a52b28424',
    'hy-CUR-141582651',
    'hy-CUR-141052037',
    'hy-CUR-142476218',
    'hy-CUR-142466819',
    'otm-04332a73-4b5b-4ce8-8e9f-d4fa660fd4ac',
    'hy-CUR-140970934',
    'hy-CUR-142447886',
    'hy-CUR-142429134',
    'hy-CUR-142341147',
    'hy-CUR-135775880',
    'hy-CUR-142440722',
    'hy-CUR-140935083',
    'hy-CUR-142470078',
    'hy-CUR-138171806',
    'hy-CUR-121867643',
    'hy-CUR-139847744',
    'hy-CUR-139847751',
    'hy-CUR-141563340',
    'hy-opt-cur-2122-cc087a40-7bcc-4727-82cc-1c820d252ff7',
    'hy-CUR-142466808',
    'hy-CUR-142469904',
    'hy-CUR-143155996',
    'hy-CUR-142461324',
    'hy-opt-cur-2122-385ee2f4-54e1-47eb-9bbf-0513ea2e8ef5',
    'hy-CUR-141574143',
    'hy-CUR-135724354',
    'hy-CUR-135712910',
    'hy-opt-cur-2122-9aea3940-4a37-420c-b1d6-3adc121ed18d',
    'hy-CUR-143052227',
    'hy-CUR-142881419',
    'hy-CUR-142676005',
    'hy-CUR-142429967',
    'hy-CUR-142483817',
    'hy-CUR-142386325',
    'hy-CUR-142466760',
    'hy-CUR-142456895',
    'hy-CUR-142450214',
    'hy-CUR-142435758',
    'hy-CUR-142417510',
    'hy-CUR-142429868',
    'hy-CUR-142363688',
    'hy-CUR-142342165',
    'hy-CUR-142148938',
    'hy-CUR-142317168',
    'hy-CUR-142426705',
    'hy-CUR-142167674',
    'hy-CUR-141614206',
    'hy-CUR-141543643',
    'hy-CUR-141429434',
    'hy-CUR-141365826',
    'hy-CUR-142483942',
    'hy-opt-cur-2122-6f454a62-2420-4c98-9733-e747e0707234',
    'hy-CUR-140972212',
    'hy-opt-cur-2122-59932b1f-c93b-4872-9e18-a9494a8198cc',
    'hy-CUR-140928019',
    'hy-CUR-141294471',
    'hy-CUR-140257248',
    'hy-opt-cur-2122-8af6f1c5-c379-45f5-84af-fa93425764e5',
    'hy-CUR-141513942',
    'hy-opt-cur-2122-58050e1f-5603-4737-85a7-e3c6025b3f46',
    'hy-CUR-142458156',
    'hy-opt-cur-2122-4de68e21-0a84-4888-b7b6-754179c2832f',
    'hy-CUR-142482144',
    'hy-CUR-143035031',
    'hy-CUR-141105328',
    'hy-CUR-143016265',
    'hy-CUR-142466820',
    'hy-CUR-142448203',
    'hy-opt-cur-2122-292fb027-4591-4db5-b4a3-cc4beb9ee6bd',
    'hy-opt-cur-2122-278afe89-31af-4b72-8cd6-ba511cd400c6',
    'hy-CUR-142458348',
    'hy-CUR-142416858',
    'hy-CUR-141582101',
    'hy-CUR-142212447',
    'hy-CUR-142210549',
    'hy-CUR-142485880',
    'hy-CUR-142447593',
    'hy-CUR-142426594',
    'hy-CUR-143156603',
    'hy-CUR-143135214',
    'hy-CUR-141663305',
    'hy-CUR-136007074',
    'hy-CUR-142418682',
    'hy-CUR-142386271',
    'hy-CUR-140909969',
    'hy-CUR-136001775',
    'hy-CUR-141101952',
    'hy-CUR-135709968',
    'hy-CUR-141600201',
    'hy-CUR-142436685',
    'hy-CUR-142466463',
    'hy-CUR-140991549',
    'hy-CUR-137328300',
    'hy-CUR-137328142',
    'hy-CUR-142429495',
    'hy-CUR-141270870',
    'hy-CUR-142374536',
    'hy-opt-cur-2122-581136f4-31c1-477a-8aef-c1bb175853e0',
    'otm-8c6f33a6-c73e-4832-b55d-027f2ff43b73',
    'hy-opt-cur-2122-8d2669fe-1556-441d-935f-eed1b33d1565',
    'hy-opt-cur-2122-e86071fd-26bf-4559-a7f7-602e27b014cb',
    'hy-opt-cur-2122-e7ab534a-582a-4b77-adcd-5fd21d11d161',
    'hy-opt-cur-2122-547b71bd-fc10-4b5d-b0e6-be8906e4a2c1',
    'hy-CUR-143094659',
    'hy-CUR-142659169',
    'hy-CUR-142466466',
    'otm-19a18a9a-6b4a-4414-ad85-71f5a3fda2d4',
    'hy-CUR-142362029',
    'hy-CUR-142484060',
    'hy-CUR-142207739',
    'hy-opt-cur-2122-db7d3dc0-b099-4249-823b-ca553de6ee5d',
    'hy-CUR-141303998',
    'hy-opt-cur-2122-01db1c77-f9e8-42e7-945a-4e11a7ea2305',
    'hy-opt-cur-2122-43eb83da-edd9-4b27-89c5-75abab91e121',
    'hy-CUR-142861243',
    'hy-CUR-142420965',
    'hy-CUR-142479485',
    'hy-CUR-142473269',
    'hy-opt-cur-2122-1128b41b-24b3-4c2f-b06d-5bbfce3ae164',
    'hy-opt-cur-2122-10eeb4e6-9ee4-46a7-95ec-3ffc7e86b038',
    'hy-CUR-142424158',
    'hy-CUR-142196511',
    'hy-CUR-141693785',
    'hy-opt-cur-2122-bf8633ea-1e42-41ed-b7e9-2b9cc0d6b8f6',
    'hy-CUR-141316593',
    'hy-opt-cur-2122-043b4efc-1704-4215-9277-837fad6a583f28b41b-24b3-4c2f-b06d-5bbfce3ae164',
    'hy-opt-cur-2122-9f78b627-6261-4eb9-91c4-426066b56cef',
    'hy-opt-cur-2122-929c7a13-fce1-4887-8012-71ce93c90535',
    'hy-opt-cur-2122-918bf7c3-6cc2-4ee0-81b7-b8f6bc9e239a',
    'hy-CUR-137780335',
    'hy-opt-cur-2122-81b1f6e5-0e7c-4978-9e8b-31ef5ae4b24b',
    'hy-opt-cur-2122-78f3925d-9f29-4c70-ab6f-9518dbfa85cb',
    'hy-CUR-140552639',
    'hy-opt-cur-2122-1138058b-45ed-46da-b283-34be93eaadd3',
    'hy-CUR-142374536',
    'hy-CUR-142349531',
  ],

  SUMMARY_SKIP_ORG_IDS: [
    'hy-org-1001813299', // Tiedekuntiin kuulumattomat laitokset
    'hy-org-1001812245', // Yliopistonpalvelut
    'hy-org-75261977', // Erillislaitokset
    'hy-org-2024-03-27-5', // Tiedekunnat
    'hy-org-2024-03-27-4', // Rehtorin alaiset laitokset
    'hy-org-2024-03-27-2', // Muut yksiköt
    'hy-org-2024-03-27-1', // Lailla erikseen säädetyt laitokset
  ],

  /**
   * Tags enabled for kasvis and kielikeskus
   */
  TAGS_ENABLED: ['600-K001', '600-M001', 'H906'],

  /**
   * The id of a LIKERT-type question that is considered the university level workload question.
   * Future ideas: get rid of this and add a new question type for it instead.
   */
  WORKLOAD_QUESTION_ID: 1042,

  NOAD_LINK_EXPIRATION_DAYS: 14,

  FEEDBACK_TARGET_CACHE_TTL: 86_400, // 24h

  USER_CACHE_TTL: 86_400, // 24h

  FEEDBACK_HIDDEN_STUDENT_COUNT: 5,

  TEACHER_REMINDER_DAYS_TO_OPEN: 7,

  STUDENT_REMINDER_DAYS_TO_CLOSE: 3,

  FEEDBACK_REMINDER_COOLDOWN: 24,

  CONFIG_TEST_VALUE: 'HY-Minttujam',

  CONFIG_NAME: 'HY',

  SENTRY_DSN: 'https://b41a87ca77fbe0da75b6c078381a66d4@toska.cs.helsinki.fi/15',

  PATE_URL: 'https://api-toska.apps.ocp-prod-0.k8s.it.helsinki.fi/pate',

  JAMI_URL: 'https://api-toska.apps.ocp-prod-0.k8s.it.helsinki.fi/jami',

  PUBLIC_URL: 'https://norppa.helsinki.fi',

  GRAYLOG_URL: 'https://toska.cs.helsinki.fi/graylog',

  TRANSLATION_NAMESPACE: 'hy',

  DEV_USERNAME: 'mluukkai',

  UNIVERSITY_ROOT_ID: 'hy-university-root-id',

  OPEN_UNIVERSITY_ORG_ID: 'hy-org-48645785',

  SUMMARY_EXCLUDED_ORG_IDS: ['hy-org-48901898', 'hy-org-48902017', 'hy-org-116718610'],

  FEEDBACK_RESPONSE_EMAILS_SINCE_DATE: '2022-01-01',

  PRIVATE_TEST: 'Pahaminttu',

  PRIVATE_KEYS: ['JAMI_URL', 'PATE_URL', 'PRIVATE_TEST'],

  IAM_GROUPS_HEADER: 'hygroupcn',

  EMPLOYEE_IAM: 'hy-employees',

  ORGANISATION_SURVEYS_ENABLED: true,

  PUBLIC_COURSE_BROWSER_ENABLED: true,

  INTERIM_FEEDBACKS_ENABLED: true,

  ALWAYS_SHOW_STUDENT_LIST: true,

  GELF_TRANSPORT_ENABLED: true,

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

  SUMMARY_COLOR_SCALE_MIN: 2.3,

  SUMMARY_COLOR_SCALE_MAX: 4.4,

  UNIVERSITY_LEVEL_VIEWING_SPECIAL_GROUPS: ['hyOne', 'allProgrammes'],

  FEEDBACK_CORRESPONDENT_SPECIAL_GROUP: 'feedbackLiaison',

  CUSTOM_SESSION_PINGER: 'Pinger-shibboleth',
}

module.exports = config
