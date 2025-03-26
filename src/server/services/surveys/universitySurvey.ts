import { Survey } from '../../models/survey'

/**
 * Gets the university survey.
 *
 * University level questions publicity is handled so that numeric questions are public and open questions are nonpublic.
 *
 * It follows that programmes and teacher can never change publicity of uni numeric questions
 * but can always change publicity of uni open questions.
 * @returns {Promise<Survey>} university survey
 */
export const getUniversitySurvey = async () => {
  const universitySurvey = await Survey.findOne({
    where: { type: 'university' },
  })
  if (!universitySurvey) {
    throw new Error('University survey not found')
  }
  await universitySurvey.populateQuestions()

  const numericQuestionIds = universitySurvey.questions
    .filter(({ type }) => type === 'LIKERT' || type === 'SINGLE_CHOICE')
    .map(({ id }) => id)

  universitySurvey.set('publicQuestionIds', numericQuestionIds)

  return universitySurvey
}
