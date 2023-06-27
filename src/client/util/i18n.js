import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpApi from 'i18next-http-backend'

import LanguageDetector from 'i18next-browser-languagedetector'
import { basePath, inProduction, LANGUAGES, TRANSLATION_NAMESPACE } from './common'

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
    backend: {
      loadPath: `${basePath}/locales/{{lng}}/{{ns}}.json`,
    },
    debug: !inProduction,
    nsSeparator: '.',
    keySeparator: ':',
    supportedLngs: LANGUAGES,
  })

// eslint-disable-next-line
window.__i18n__ = i18n
