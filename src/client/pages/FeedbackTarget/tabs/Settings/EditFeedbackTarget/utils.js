import feedbackTargetIsOpen from '../../../../../util/feedbackTargetIsOpen'

export const getUpperLevelQuestions = feedbackTarget => {
  const { universitySurvey, programmeSurveys } = feedbackTarget.surveys ?? {}

  return {
    universityQuestions: universitySurvey?.questions ?? [],
    programmeQuestions: programmeSurveys?.flatMap(survey => survey.questions) ?? [],
  }
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

// A programme survey belongs to the organisation whose code is its typeId, so the organisations that
// have acually contributed questions are the ones with a non-empty programme survey
export const getContributingOrganisationNames = (feedbackTarget, language) => {
  const { programmeSurveys } = feedbackTarget.surveys ?? {}
  const { organisations } = feedbackTarget.courseUnit ?? {}

  const contributingCodes = (programmeSurveys ?? [])
    .filter(survey => survey.questions?.some(q => q.type !== 'TEXT'))
    .map(survey => survey.typeId)

  return (organisations ?? [])
    .filter(organisation => contributingCodes.includes(organisation.code))
    .map(organisation => getOrganisationName(organisation, language))
}
