const i18n = require('i18next')
const FsBackend = require('i18next-fs-backend')
const { TRANSLATION_NAMESPACE } = require('./config')

i18n.use(FsBackend).init({
  lng: 'fi', // doesnt matter in backend. One should always use getFixedT anyways.
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

const t = (key, options) => i18n.t(key, options)

const getFixedT = lang => {
  const t = i18n.getFixedT(lang)
  return t
}

module.exports = { i18n, t, getFixedT }
