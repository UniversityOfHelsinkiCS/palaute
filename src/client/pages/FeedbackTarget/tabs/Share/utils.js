import { format } from 'date-fns'

export const formatClosesAt = closesAt => format(new Date(closesAt), 'dd.MM.yyyy')

export const getDefaultMessageLanguage = ({ teachingLanguages, userLanguage }) => {
  if (!teachingLanguages) return userLanguage

  if (teachingLanguages.length === 1) return teachingLanguages[0]

  if (teachingLanguages.includes('fi')) return 'fi'

  if (teachingLanguages.includes('sv')) return 'sv'

  return userLanguage
}
