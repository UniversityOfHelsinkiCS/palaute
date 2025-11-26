import { LanguageId } from '@common/types/common'

export const getLanguageValue = (values: Record<LanguageId, string>, preferred: LanguageId) => {
  const possibleLangs = ['fi', 'en', 'sv'] as const

  if (values[preferred]) return values[preferred]

  // eslint-disable-next-line
  for (const lang of possibleLangs) {
    if (values[lang]) return values[lang]
  }

  return null
}
