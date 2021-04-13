const { v4: uuid } = require('uuid')
const { ApplicationError } = require('../util/customErrors')
const { Survey } = require('../models')
const defaultQuestions = require('../util/questions.json')

const getQuestionsByCourseId = async (req, res) => {
  const { user } = req

  if (!user) throw new ApplicationError('Not found', 404)

  const [questions, created] = await Survey.findOrCreate({
    where: {
      feedbackTargetId: req.params.id,
    },
    defaults: {
      feedbackTargetId: req.params.id,
      data: defaultQuestions
    }
  })

  if (!questions) throw new ApplicationError('Not found', 404)

  res.send(questions)
}

const updateQuestionsByCourseId = async (req, res) => {
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
  getQuestionsByCourseId,
  updateQuestionsByCourseId,
}
