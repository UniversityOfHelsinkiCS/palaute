const { ApplicationError } = require('../util/customErrors')
const { Survey, Question } = require('../models')

const handleListOfUpdatedQuestionsAndReturnIds = async (questions) => {
  const updatedQuestionIdsList = []

  /* eslint-disable */
  for (const question of questions) {
    let updatedQuestion
    if (question.id) {
      const [_, updatedQuestions] = await Question.update(
        {
          ...question,
        },
        { where: { id: question.id }, returning: true },
      )
      updatedQuestion = updatedQuestions[0]
    } else {
      updatedQuestion = await Question.create({
        ...question,
      })
    }

    updatedQuestionIdsList.push(updatedQuestion.id)
  }
  /* eslint-enable */

  return updatedQuestionIdsList
}

const addQuestion = async (req, res) => {
  const survey = await Survey.findByPk(Number(req.params.id))
  if (!survey) throw new ApplicationError('Not found', 404)

  const question = await Question.create({
    ...req.body,
  })
  survey.questionIds = [...survey.questionIds, question.id]
  const updatedSurvey = await survey.save()

  updatedSurvey.questions = await survey.getQuestions()
  res.send(updatedSurvey)
}

const update = async (req, res) => {
  const survey = await Survey.findByPk(Number(req.params.id))
  if (!survey) throw new ApplicationError('Not found', 404)

  const { questions } = req.body

  if (questions) {
    survey.questionIds = await handleListOfUpdatedQuestionsAndReturnIds(
      questions,
    )
  }

  const updatedSurvey = await survey.save()
  await updatedSurvey.populateQuestions()

  res.send(updatedSurvey)
}

module.exports = {
  addQuestion,
  update,
}
