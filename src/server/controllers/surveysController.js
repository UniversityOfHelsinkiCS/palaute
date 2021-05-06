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
  const { isAdmin } = req
  const survey = await Survey.findByPk(Number(req.params.id))
  if (!survey) throw new ApplicationError('Not found', 404)
  if (survey.type === 'university' && !isAdmin)
    throw new ApplicationError('Forbidden', 403)
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

const getSurveyByCourseCode = async (req, res) => {
  const courseCode = req.params.code

  const [survey] = await Survey.findOrCreate({
    where: {
      type: 'courseUnit',
      typeId: courseCode,
    },
    include: 'courseUnit',
    defaults: {
      questionIds: [],
      type: 'courseUnit',
      typeId: courseCode,
    },
  })

  await survey.populateQuestions()

  res.send(survey)
}

const getUniversitySurvey = async (req, res) => {
  const survey = await Survey.findOne({
    where: {
      type: 'university',
    },
  })

  if (!survey) throw new ApplicationError('Not found', 404)

  await survey.populateQuestions()

  res.send(survey)
}

module.exports = {
  addQuestion,
  update,
  getSurveyByCourseCode,
  getUniversitySurvey,
}
