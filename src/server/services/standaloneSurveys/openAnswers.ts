import { sequelize } from '../../db/dbConnection'
import { StandaloneSurvey, StandaloneSurveyResponse } from '../../models'
import { ApplicationError } from '../../util/ApplicationError'
import { removeOpenAnswers, setOpenAnswersHidden } from '../../util/openAnswers'
import { getQuestions } from './getSurvey'

const assertOpenQuestion = (survey: StandaloneSurvey, questionId: number) => {
  const question = getQuestions(survey).find(q => q.id === questionId)
  if (question?.type !== 'OPEN') throw ApplicationError.BadRequest('Not an open question of this survey')
}

const getResponses = (survey: StandaloneSurvey) =>
  StandaloneSurveyResponse.findAll({ where: { standaloneSurveyId: survey.id } })

export const hideAnswers = async (survey: StandaloneSurvey, questionId: number, content: string, hidden: boolean) => {
  assertOpenQuestion(survey, questionId)

  const results = (await getResponses(survey)).map(response => {
    const { data, matchedCount, changedCount } = setOpenAnswersHidden(response.data, questionId, content, hidden)
    response.data = data
    return { response, matchedCount, changedCount }
  })

  if (results.every(r => r.matchedCount === 0)) throw ApplicationError.BadRequest('Matching answer not found')

  const changed = results.filter(r => r.changedCount > 0)
  await sequelize.transaction(async transaction => {
    for (const { response } of changed) {
      await response.save({ transaction })
    }
  })

  return changed.reduce((sum, r) => sum + r.changedCount, 0)
}

export const deleteAnswers = async (survey: StandaloneSurvey, questionId: number, content: string) => {
  assertOpenQuestion(survey, questionId)

  const changed = (await getResponses(survey)).flatMap(response => {
    const { data, removed } = removeOpenAnswers(response.data, questionId, content)
    response.data = data
    return removed ? [response] : []
  })

  if (changed.length === 0) throw ApplicationError.BadRequest('Matching answer not found')

  await sequelize.transaction(async transaction => {
    for (const response of changed) {
      await response.save({ transaction })
    }
  })

  return changed.length
}
