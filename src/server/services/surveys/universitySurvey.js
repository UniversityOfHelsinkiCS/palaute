const Survey = require('../../models/survey')

/**
 *
 * @returns {Promise<Survey>} university survey
 */
const getUniversitySurvey = async () => {
  const universitySurvey = await Survey.findOne({
    where: { type: 'university' },
  })
  await universitySurvey.populateQuestions()

  const numericQuestionIds = universitySurvey.questions
    .filter(({ type }) => type === 'LIKERT' || type === 'SINGLE_CHOICE')
    .map(({ id }) => id)

  universitySurvey.set('publicQuestionIds', numericQuestionIds)

  return universitySurvey
}

module.exports = getUniversitySurvey
