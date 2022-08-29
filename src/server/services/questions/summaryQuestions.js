const { Survey } = require('../../models')

const WORKLOAD_QUESTION_ID = 1042

const getSummaryQuestions = async (organisationCode) => {
  const [universityQuestions, programmeQuestions] = await Promise.all([
    (async () => {
      const universitySurvey = await Survey.findOne({
        where: { type: 'university' },
      })
      await universitySurvey.populateQuestions()
      return universitySurvey.questions
    })(),
    (async () => {
      if (!organisationCode) return []
      const programmeSurvey = await Survey.findOne({
        where: { type: 'programme', typeId: organisationCode },
      })
      if (!programmeSurvey) return []
      await programmeSurvey.populateQuestions()
      return programmeSurvey.questions
    })(),
  ])

  const questions = universityQuestions.concat(programmeQuestions)
  const summaryQuestions = questions.filter(
    (q) => q.type === 'LIKERT' || q.id === WORKLOAD_QUESTION_ID,
  )

  return summaryQuestions.map((question) => ({
    ...question.toJSON(),
    secondaryType: question.id === WORKLOAD_QUESTION_ID ? 'WORKLOAD' : null,
  }))
}

module.exports = getSummaryQuestions
