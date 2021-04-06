import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '../locales/en'

const initializeI18n = () =>
  i18n.use(initReactI18next).init({
    resources: {
      en,
    },
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
  })

export default initializeI18n
