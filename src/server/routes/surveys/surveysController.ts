import { Response, Router } from 'express'
import { ApplicationError } from '../../util/ApplicationError'
import { Survey, Question, Organisation, User } from '../../models'
import { createOrganisationSurveyLog } from '../../services/auditLog'
import { getUniversitySurvey as _getUniversitySurvey } from '../../services/surveys'
import { getUserOrganisationAccess } from '../../services/organisationAccess/organisationAccess'
import { AuthenticatedRequest } from '../../types'

const checkUserWriteAccess = async (survey: Survey, user: User) => {
  const organisationAccess = await getUserOrganisationAccess(user)

  const surveysOrganisation = organisationAccess.find(({ organisation }) => organisation.code === survey.typeId)

  return surveysOrganisation?.access?.write ?? false
}

const handleListOfUpdatedQuestionsAndReturnIds = async (questions: Question[]) => {
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

const update = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const survey = await Survey.findByPk(Number(req.params.id))

  if (!survey) ApplicationError.NotFound('Survey not found')

  if (survey.type === 'feedbackTarget') ApplicationError.Forbidden('Wrong endpoint to update fbt survey')

  const isUniversitySurvey = survey.type === 'university'

  if (isUniversitySurvey && !user.isAdmin) ApplicationError.Forbidden('Only admins can update university survey')

  if (survey.type === 'programme') {
    const writeAccess = await checkUserWriteAccess(survey, user)
    if (!writeAccess) ApplicationError.Forbidden('User does not have write access to this survey')
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

  res.send(updatedSurvey)
}

const getUniversitySurvey = async (req: AuthenticatedRequest, res: Response) => {
  const survey = await _getUniversitySurvey()

  res.send(survey)
}

const getFullOrganisationSurvey = async (req: AuthenticatedRequest, res: Response) => {
  const { organisationCode } = req.params

  const universitySurvey = await _getUniversitySurvey()
  const [survey] = await Survey.findAll({
    where: {
      type: 'programme',
      typeId: organisationCode,
    },
  })

  if (!survey) {
    res.send(universitySurvey)
    return
  }

  await survey.populateQuestions()

  const questions = universitySurvey.questions.concat(survey.questions)

  const response = { ...universitySurvey, questions }

  res.send(response)
}

const getProgrammeSurveyForEditor = async (req: AuthenticatedRequest, res: Response) => {
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

  res.send(response)
}

export const router = Router()

router.put('/:id', update)
router.get('/university', getUniversitySurvey)
router.get('/organisation/:organisationCode', getFullOrganisationSurvey)
router.get('/programme/:surveyCode', getProgrammeSurveyForEditor)
