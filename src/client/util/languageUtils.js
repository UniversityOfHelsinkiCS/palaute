import { fi, sv, enGB as en } from 'date-fns/locale'

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
