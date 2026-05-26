import { Op } from 'sequelize'
import { sequelize } from '../../db/dbConnection'
import { Survey, Question } from '../../models'
import { WORKLOAD_QUESTION_ID } from '../../util/config'

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

export const createUniversitySurvey = async (validFrom: Date) => {
  const source = await Survey.findOne({
    where: { type: 'university' },
    order: [sequelize.literal('"valid_from" DESC NULLS LAST')],
  })

  if (!source) throw new Error('No university survey found to clone from')

  const sourceQuestions = await Question.findAll({ where: { id: source.questionIds } })

  const questionsToClone = sourceQuestions.filter(q => q.id !== WORKLOAD_QUESTION_ID)
  const cloned = await Question.bulkCreate(
    questionsToClone.map(({ type, secondaryType, required, data }) => ({ type, secondaryType, required, data })),
    { returning: true }
  )

  const clonedIdMap = new Map(questionsToClone.map((q, i) => [q.id, cloned[i].id]))
  const questionIds = source.questionIds.map(id => (id === WORKLOAD_QUESTION_ID ? id : clonedIdMap.get(id)!))

  const newSurvey = await Survey.create({ type: 'university', typeId: source.typeId, validFrom, questionIds })
  await newSurvey.populateQuestions()

  const numericQuestionIds = newSurvey.questions
    ?.filter(({ type }) => type === 'LIKERT' || type === 'SINGLE_CHOICE')
    .map(({ id }) => id)
  newSurvey.set('publicQuestionIds', numericQuestionIds)

  return newSurvey
}

export const getAllUniversitySurveys = async () => {
  const surveys = await Survey.findAll({
    where: { type: 'university' },
    order: [sequelize.literal('"valid_from" DESC NULLS LAST')],
  })

  await Promise.all(surveys.map(s => s.populateQuestions()))
  return surveys
}
