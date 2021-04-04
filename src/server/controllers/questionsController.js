const { v4: uuid } = require('uuid')
const { ApplicationError } = require('../util/customErrors')
const { Question } = require('../models')

const getQuestionsByCourseId = async (req, res) => {
  const { currentUser } = req

  if (!currentUser) throw new ApplicationError('Not found', 404)

  const questions = await Question.findOne({
    where: {
      courseRealisationId: req.params.id,
    },
  })

  if (!questions) throw new ApplicationError('Not found', 404)

  res.send(questions)
}

const updateQuestionsByCourseId = async (req, res) => {
  const { currentUser } = req

  if (!currentUser) throw new ApplicationError('Not found', 404)

  const questions = await Question.findOne({
    where: {
      courseRealisationId: req.params.id,
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
