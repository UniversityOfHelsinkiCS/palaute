import { WORKLOAD_QUESTION_ID } from '../../util/config'
import { getUniversitySurvey, getProgrammeSurvey } from '../surveys'

export const getSummaryQuestions = async (organisationCode: string) => {
  const [universityQuestions, programmeQuestions] = await Promise.all([
    (async () => {
      const universitySurvey = await getUniversitySurvey()
      return universitySurvey.questions
    })(),
    (async () => {
      if (!organisationCode) return []
      const programmeSurvey = await getProgrammeSurvey(organisationCode)
      if (!programmeSurvey) return []
      return programmeSurvey.questions
    })(),
  ])

  const questions = universityQuestions.concat(programmeQuestions)
  const summaryQuestions = questions.filter(q => q.type === 'LIKERT' || q.id === WORKLOAD_QUESTION_ID)

  return summaryQuestions.map(question => question.toJSON())
}
