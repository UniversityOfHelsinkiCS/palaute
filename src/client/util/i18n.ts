import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpApi from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

import { basePath, LANGUAGES, TRANSLATION_NAMESPACE } from './common'

declare global {
  interface Window {
    __i18n__: typeof i18n
  }
}

/**
 * Load the translation files using Http backend, from public server resources (public/locales/)
 * We swap around the default namespace separator and keyseparator of i18n, because of how existing code used namespaces.
 * Now, namespace specifies the translation variant to be used. For example, HY would use the 'hy' namespace.
 * The namespace to be used is specified by the config value TRANSLATION_NAMESPACE.
 * When a key is not found from the primary specified namespace, the fallback namespace 'translations' is used.
 */
i18n
  .use(initReactI18next)
  .use(HttpApi)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    defaultNS: TRANSLATION_NAMESPACE,
    fallbackNS: 'translation',
    load: 'languageOnly',
    preload: LANGUAGES,
    backend: {
      loadPath: `${basePath}/locales/{{lng}}/{{ns}}.json`,
    },
    debug: false,
    nsSeparator: '.',
    keySeparator: ':',
    supportedLngs: LANGUAGES,
  })

// eslint-disable-next-line no-underscore-dangle
window.__i18n__ = i18n
