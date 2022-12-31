const { Router } = require('express')
const { ApplicationError } = require('../../util/customErrors')
const { Survey, Question, Organisation } = require('../../models')
const { createOrganisationSurveyLog } = require('../../util/auditLog')
const { getUniversitySurvey: _getUniversitySurvey } = require('../../services/surveys')

const checkUserWriteAccess = async (survey, user) => {
  const organisationAccess = await user.getOrganisationAccess()

  const organisation = organisationAccess.find(({ organisation }) => organisation.code === survey.typeId)

  return organisation?.access?.write ?? false
}

const handleListOfUpdatedQuestionsAndReturnIds = async questions => {
  const updatedQuestionIdsList = []

  /* eslint-disable */
  for (const question of questions) {
    let updatedQuestion
    if (question.id) {
      const [_, updatedQuestions] = await Question.update(
        {
          ...question,
        },
        { where: { id: question.id }, returning: true }
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

const update = async (req, res) => {
  const { isAdmin, user } = req
  const survey = await Survey.findByPk(Number(req.params.id))

  if (!survey) throw new ApplicationError('Not found', 404)

  const isUniversitySurvey = survey.type === 'university'

  if (isUniversitySurvey && !isAdmin) throw new ApplicationError('Forbidden', 403)

  if (survey.type === 'programme') {
    const writeAccess = await checkUserWriteAccess(survey, user)
    if (!writeAccess) throw new ApplicationError('Forbidden', 403)
  }

  const { questions } = req.body

  if (questions) {
    if (!isUniversitySurvey) {
      await createOrganisationSurveyLog(survey, questions, user)
    }
    survey.questionIds = await handleListOfUpdatedQuestionsAndReturnIds(questions)
  }

  // Mark updatedAt as changed to force a query. Otherwise save() may not actually run a query and trigger hooks
  survey.changed('updatedAt', true)
  const updatedSurvey = await survey.save()
  await updatedSurvey.populateQuestions()

  return res.send(updatedSurvey)
}

const getUniversitySurvey = async (req, res) => {
  const survey = await _getUniversitySurvey()

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

  const universitySurvey = await _getUniversitySurvey()

  const organisation = await Organisation.findOne({
    where: {
      code: surveyCode,
    },
  })

  await survey.populateQuestions()

  const response = { ...survey.toJSON(), universitySurvey, organisation }

  return res.send(response)
}

const router = Router()

router.put('/:id', update)
router.get('/university', getUniversitySurvey)
router.get('/programme/:surveyCode', getProgrammeSurvey)

module.exports = router
