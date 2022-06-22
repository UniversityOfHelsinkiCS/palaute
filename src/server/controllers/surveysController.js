const { Op } = require('sequelize')
const _ = require('lodash')

const { ApplicationError } = require('../util/customErrors')
const { Survey, Question, Organisation, OrganisationLog } = require('../models')

const checkUserWriteAccess = async (survey, user) => {
  const organisationAccess = await user.getOrganisationAccess()

  const organisation = organisationAccess.find(
    ({ organisation }) => organisation.code === survey.typeId,
  )

  return organisation?.access?.write ?? false
}

const createOrganisationSurveyLog = async (survey, questions, user) => {
  let previousQuestions = await Question.findAll({
    where: {
      id: { [Op.in]: survey.questionIds },
    },
    attributes: ['id', 'type', 'data', 'required'],
  })
  previousQuestions = previousQuestions.map((question) => question.dataValues)

  questions = questions.map(({ id, type, data, required }) => ({
    id,
    type,
    data,
    required,
  }))

  const organisation = await Organisation.findOne({
    where: {
      code: survey.typeId,
    },
    attributes: ['id'],
  })

  const deletedQuestions = previousQuestions.filter(
    (question) => !questions.find((q) => q.id === question.id),
  )

  for (const question of deletedQuestions) {
    const data = {
      deleteQuestion: {
        id: question.id,
        type: question.type,
        ...question.data,
      },
    }

    await OrganisationLog.create({
      data,
      organisationId: organisation.id,
      userId: user.id,
    })
  }

  for (const question of questions) {
    let data
    if (question.id) {
      const previousQuestion = previousQuestions.find(
        (q) => q.id === question.id,
      )
      // Get the changed values of the question
      const difference = _.fromPairs(
        _.differenceWith(
          _.toPairs(question),
          _.toPairs(previousQuestion),
          _.isEqual,
        ),
      )
      // eslint-disable-next-line no-continue
      if (Object.keys(difference).length === 0) continue

      data = {
        updateQuestion: {
          id: question.id,
          previousLabel: previousQuestion.data.label.en,
          ...difference,
        },
      }
    } else {
      data = {
        createQuestion: {
          id: question.id,
          ...question.data,
          type: question.type,
          required: question.required,
        },
      }
    }

    await OrganisationLog.create({
      data,
      organisationId: organisation.id,
      userId: user.id,
    })
  }
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
  return res.send(updatedSurvey)
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
    await createOrganisationSurveyLog(survey, questions, user)
    survey.questionIds = await handleListOfUpdatedQuestionsAndReturnIds(
      questions,
    )
  }

  const updatedSurvey = await survey.save()
  await updatedSurvey.populateQuestions()

  return res.send(updatedSurvey)
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

  return res.send(survey)
}

const getUniversitySurvey = async (req, res) => {
  const survey = await Survey.findOne({
    where: {
      type: 'university',
    },
  })

  if (!survey) throw new ApplicationError('Not found', 404)

  await survey.populateQuestions()

  return res.send(survey)
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

  return res.send(response)
}

module.exports = {
  addQuestion,
  update,
  getSurveyByCourseCode,
  getUniversitySurvey,
  getProgrammeSurvey,
}
