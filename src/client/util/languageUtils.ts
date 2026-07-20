import { fi, sv, enGB as en } from 'date-fns/locale'
import i18next from 'i18next'
import type { LocalizedString } from '@common/types/common'

export const getLanguageValue = (values: LocalizedString, preferred: string) => {
  if (!values) {
    return null
  }

  const possibleLangs = ['fi', 'en', 'sv']

  if (values[preferred]) return values[preferred]

  for (const lang of possibleLangs) {
    if (values[lang]) return values[lang]
  }

  return null
}

export const localeForLanguage = (lang: string) => {
  if (!lang) return en
  return { fi, sv, en }[lang]
}

export const getAllTranslations = (key: string) => ({
  fi: i18next.getFixedT('fi')(key),
  sv: i18next.getFixedT('sv')(key),
  en: i18next.getFixedT('en')(key),
})
