const { ApplicationError } = require('../util/customErrors')
const { Survey, Question, Organisation } = require('../models')

const checkUserWriteAccess = async (survey, user) => {
  const organisationAccess = await user.getOrganisationAccess()

  const organisation = organisationAccess.find(
    ({ organisation }) => organisation.code === survey.typeId,
  )

  return organisation?.access?.write ?? false
}

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
  const { isAdmin, user } = req
  const survey = await Survey.findByPk(Number(req.params.id))

  if (!survey) throw new ApplicationError('Not found', 404)

  if (survey.type === 'university' && !isAdmin)
    throw new ApplicationError('Forbidden', 403)

  if (survey.type === 'programme') {
    const writeAccess = await checkUserWriteAccess(survey, user)
    if (!writeAccess) throw new ApplicationError('Forbidden', 403)
  }

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

const getProgrammeSurvey = async (req, res) => {
  const { surveyCode } = req.params

  const [survey] = await Survey.findOrCreate({
    where: {
      type: 'programme',
      typeId: surveyCode,
    },
    defaults: {
      questionIds: [],
      type: 'programme',
      typeId: surveyCode,
    },
  })

  const universitySurvey = await Survey.findOne({
    where: {
      type: 'university',
    },
  })

  const organisation = await Organisation.findOne({
    where: {
      code: surveyCode,
    },
  })

  await survey.populateQuestions()

  await universitySurvey.populateQuestions()

  const response = { ...survey.toJSON(), universitySurvey, organisation }

  res.send(response)
}

module.exports = {
  addQuestion,
  update,
  getSurveyByCourseCode,
  getUniversitySurvey,
  getProgrammeSurvey,
}
