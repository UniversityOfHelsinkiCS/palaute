import { Op } from 'sequelize'
import { sequelize } from '../../db/dbConnection'
import { Survey } from '../../models/survey'

/**
 * Gets the university survey valid at the given reference date.
 * Picks the row with the greatest valid_from that is <= referenceDate,
 * treating NULL valid_from as "valid from the beginning of time".
 *
 * University level questions publicity is handled so that numeric questions are public and open questions are nonpublic.
 *
 * It follows that programmes and teacher can never change publicity of uni numeric questions
 * but can always change publicity of uni open questions.
 */
export const getUniversitySurvey = async (referenceDate: Date) => {
  const universitySurvey = await Survey.findOne({
    where: {
      type: 'university',
      [Op.or]: [{ validFrom: null }, { validFrom: { [Op.lte]: referenceDate } }],
    },
    order: [sequelize.literal('"valid_from" DESC NULLS LAST')],
  })

  if (!universitySurvey) {
    throw new Error('University survey not found')
  }
  await universitySurvey.populateQuestions()

  const numericQuestionIds = universitySurvey.questions
    ?.filter(({ type }) => type === 'LIKERT' || type === 'SINGLE_CHOICE')
    .map(({ id }) => id)

  universitySurvey.set('publicQuestionIds', numericQuestionIds)

  return universitySurvey
}

export const getAllUniversitySurveys = async () => {
  const surveys = await Survey.findAll({
    where: { type: 'university' },
    order: [sequelize.literal('"valid_from" DESC NULLS LAST')],
  })

  await Promise.all(surveys.map(s => s.populateQuestions()))
  return surveys
}
