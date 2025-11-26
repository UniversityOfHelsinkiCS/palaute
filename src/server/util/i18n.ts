import i18n from 'i18next'
import FsBackend from 'i18next-fs-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import { TRANSLATION_NAMESPACE } from './config'

i18n
  .use(FsBackend)
  .use(LanguageDetector)
  .init(
    {
      fallbackLng: 'en',
      supportedLngs: ['fi', 'en', 'sv'],
      ns: ['translation', TRANSLATION_NAMESPACE], // https://www.i18next.com/principles/fallback#namespace-fallback
      defaultNS: TRANSLATION_NAMESPACE,
      fallbackNS: 'translation',
      load: ['fi', 'en', 'sv'] as any, // load all langs on initialization
      preload: ['fi', 'en', 'sv'], // preload all langs. This is needed for getFixedT to properly work in backend
      backend: {
        loadPath: './public/locales/{{lng}}/{{ns}}.json',
      },
      debug: false, // turn on for debugging
      nsSeparator: '.',
      keySeparator: ':',
    },
    () => {} // Empty callback
  )

export { i18n }
