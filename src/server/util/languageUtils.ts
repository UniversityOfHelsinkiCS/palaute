import { LanguageId, LocalizedString } from '@common/types/common'

export const getLanguageValue = (values: LocalizedString, preferred: LanguageId) => {
  const possibleLangs = ['fi', 'en', 'sv'] as const

  if (values[preferred]) return values[preferred]

  for (const lang of possibleLangs) {
    if (values[lang]) return values[lang]
  }

  return null
}
