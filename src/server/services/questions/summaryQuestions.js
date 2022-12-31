const { getUniversitySurvey, getProgrammeSurvey } = require('../surveys')

const WORKLOAD_QUESTION_ID = 1042

/**
 * @param {string} organisationCode
 * @returns {Promise<object>} questions
 */
const getSummaryQuestions = async organisationCode => {
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

  return summaryQuestions.map(question => ({
    ...question.toJSON(),
    secondaryType: question.id === WORKLOAD_QUESTION_ID ? 'WORKLOAD' : null,
  }))
}

module.exports = getSummaryQuestions
