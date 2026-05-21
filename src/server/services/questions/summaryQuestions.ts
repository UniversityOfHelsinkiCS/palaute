import { WORKLOAD_QUESTION_ID } from '../../util/config'
import { getUniversitySurvey, getProgrammeSurvey } from '../surveys'

export const getSummaryQuestions = async (organisationCode: string, referenceDate: Date) => {
  const [universityQuestions, programmeQuestions] = await Promise.all([
    (async () => {
      const universitySurvey = await getUniversitySurvey(referenceDate)
      return universitySurvey.questions
    })(),
    (async () => {
      if (!organisationCode) return []
      const programmeSurvey = await getProgrammeSurvey(organisationCode)
      if (!programmeSurvey) return []
      return programmeSurvey.questions
    })(),
  ])

  const questions = [...(universityQuestions ?? []), ...(programmeQuestions ?? [])]
  const summaryQuestions = questions?.filter(q => q.type === 'LIKERT' || q.id === WORKLOAD_QUESTION_ID)

  return summaryQuestions?.map(question => question.toJSON())
}
