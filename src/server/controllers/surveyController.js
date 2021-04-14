const { v4: uuid } = require('uuid')
const { ApplicationError } = require('../util/customErrors')
const { Survey } = require('../models')
const defaultQuestions = require('../util/questions.json')

const getSurveyByCourseId = async (req, res) => {
  const { user } = req

  if (!user) throw new ApplicationError('Not found', 404)

  const [questions] = await Survey.findOrCreate({
    where: {
      feedbackTargetId: Number(req.params.id),
    },
    defaults: {
      feedbackTargetId: Number(req.params.id),
      data: defaultQuestions,
    },
  })

  if (!questions) throw new ApplicationError('Not found', 404)

  res.send(questions)
}

const updateSurveyByCourseId = async (req, res) => {
  const { user } = req

  if (!user) throw new ApplicationError('Not found', 404)

  const questions = await Survey.findOne({
    where: {
      feedbackTargetId: req.params.id,
    },
  })
  if (!questions) throw new ApplicationError('Not found', 404)
  // must mangeli ids
  const acualData = {
    ...req.body.data,
    questions: req.body.data.questions.map((question) =>
      question.id
        ? question
        : {
            ...question,
            id: uuid(),
          },
    ),
  }
  questions.data = acualData
  const updatedQuestions = await questions.save()

  res.send(updatedQuestions)
}

module.exports = {
  getSurveyByCourseId,
  updateSurveyByCourseId,
}
