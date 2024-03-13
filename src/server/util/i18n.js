const i18n = require('i18next')
const FsBackend = require('i18next-fs-backend')
const LanguageDetector = require('i18next-browser-languagedetector')
const { TRANSLATION_NAMESPACE } = require('./config')

i18n
  .use(FsBackend)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['fi', 'en', 'sv'],
    ns: ['translation', TRANSLATION_NAMESPACE], // https://www.i18next.com/principles/fallback#namespace-fallback
    defaultNS: TRANSLATION_NAMESPACE,
    fallbackNS: 'translation',
    load: ['fi', 'en', 'sv'], // load all langs on initialization
    preload: ['fi', 'en', 'sv'], // preload all langs. This is needed for getFixedT to properly work in backend
    backend: {
      loadPath: `./public/locales/{{lng}}/{{ns}}.json`,
    },
    debug: false, // turn on for debugging
    nsSeparator: '.',
    keySeparator: ':',
  })

module.exports = { i18n }
