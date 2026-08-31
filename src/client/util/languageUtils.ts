import type { LocalizedString } from '@common/types/common'

import { fi, sv, enGB as en } from 'date-fns/locale'
import i18next from 'i18next'

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

// Prefer the short label in the user's own language. If it is missing there, prefer showing
// the full label in the user's language over falling back to another language. Only once
// nothing is available in the user's language do we fall back to other languages, still
// preferring a short label there over a full one.
export const getShortLabelValue = (shortLabel: LocalizedString, label: LocalizedString, preferred: string) =>
  (shortLabel && shortLabel[preferred]) ||
  (label && label[preferred]) ||
  getLanguageValue(shortLabel, preferred) ||
  getLanguageValue(label, preferred)

// Helper function to check if the value returned by getShortLabelValue is acually short label
// or if it fell back to full label instead.
export const getResolvedShortLabel = (shortLabel: LocalizedString, preferred: string) =>
  (shortLabel && shortLabel[preferred]) || getLanguageValue(shortLabel, preferred)

export const localeForLanguage = (lang: string) => {
  if (!lang) return en
  return { fi, sv, en }[lang]
}

export const getAllTranslations = (key: string) => ({
  fi: i18next.getFixedT('fi')(key),
  sv: i18next.getFixedT('sv')(key),
  en: i18next.getFixedT('en')(key),
})
