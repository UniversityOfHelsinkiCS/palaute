import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpApi from 'i18next-http-backend'
import { inProduction, TRANSLATION_NAMESPACE } from './common'

//import en from '../locales/en'
//import fi from '../locales/fi'
//import sv from '../locales/sv'

i18n.use(initReactI18next).use(HttpApi).init({
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: TRANSLATION_NAMESPACE,
  fallbackNS: 'translation',
  load: 'languageOnly',
  debug: !inProduction,
  nsSeparator: '.',
  keySeparator: ':',
})

// eslint-disable-next-line
window.__i18n__ = i18n
