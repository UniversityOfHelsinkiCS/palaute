import feedbackTargetIsOpen from '../../../../../util/feedbackTargetIsOpen'

export const getUpperLevelQuestions = feedbackTarget => {
  const { universitySurvey, programmeSurveys } = feedbackTarget.surveys ?? {}

  return [...(universitySurvey?.questions ?? []), ...(programmeSurveys?.questions ?? [])]
}

export const feedbackTargetIsOpenOrClosed = feedbackTarget => {
  const closesAt = new Date(feedbackTarget.closesAt)

  return new Date() > closesAt || feedbackTargetIsOpen(feedbackTarget)
}

const getOrganisationName = ({ name }, language) => {
  // Some organisations only have a Finnish name
  const localizedName = name[language] ?? name.fi ?? name.en ?? name.sv

  return localizedName.replace("'", '`')
}

export const getOrganisationNames = (feedbackTarget, language) => {
  const { organisations } = feedbackTarget.courseUnit

  if (!organisations) return { primaryOrganisation: 'Helsingin yliopisto' }

  if (organisations.length === 1)
    return {
      primaryOrganisation: getOrganisationName(organisations[0], language),
    }

  const lastCode = organisations[organisations.length - 1].code

  const allOrganisations = organisations.reduce((a, b) => {
    if (b.code === lastCode) return `${a}${getOrganisationName(b, language)}`
    return `${a}${getOrganisationName(b, language)}, `
  }, '')

  return {
    allOrganisations,
  }
}
