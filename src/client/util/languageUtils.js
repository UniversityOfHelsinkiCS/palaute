import { fi, sv, enGB as en } from 'date-fns/locale'
import i18next from 'i18next'

export const getLanguageValue = (values, preferred) => {
  if (!values) {
    return null
  }

  const possibleLangs = ['fi', 'en', 'sv']

  if (values[preferred]) return values[preferred]

  // eslint-disable-next-line
  for (const lang of possibleLangs) {
    if (values[lang]) return values[lang]
  }

  return null
}

export const localeForLanguage = lang => {
  if (!lang) return en
  return { fi, sv, en }[lang]
}

export const getAllTranslations = key => ({
  fi: i18next.getFixedT('fi')(key),
  sv: i18next.getFixedT('sv')(key),
  en: i18next.getFixedT('en')(key),
})
