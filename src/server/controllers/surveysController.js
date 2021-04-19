const { ApplicationError } = require('../util/customErrors')
const { Survey, Question } = require('../models')

const addQuestion = async (req, res) => {
  const survey = await Survey.findByPk(Number(req.params.id))
  if (!survey) throw new ApplicationError('Not found', 404)

  const question = await Question.create({
    ...req.body,
  })
  survey.questionIds.push(question.id)
  await survey.save()

  const questions = await survey.getQuestions()
  res.send(questions)
}

const update = async (req, res) => {
  const survey = await Survey.findByPk(Number(req.params.id))
  if (!survey) throw new ApplicationError('Not found', 404)

  survey.data = req.body
  const updatedSurvey = await survey.save()

  res.send(updatedSurvey)
}

module.exports = {
  addQuestion,
  update,
}
