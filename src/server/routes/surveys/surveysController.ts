import { Response, Router } from 'express'
import z from 'zod/v4'
import { sequelize } from '../../db/dbConnection'
import { ApplicationError } from '../../util/ApplicationError'
import { Survey, Question, Organisation, User } from '../../models'
import { createOrganisationSurveyLog } from '../../services/auditLog'
import {
  getUniversitySurvey as _getUniversitySurvey,
  createUniversitySurvey as _createUniversitySurvey,
} from '../../services/surveys'
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

  if (!survey) throw ApplicationError.NotFound('Survey not found')

  if (survey.type === 'feedbackTarget') throw ApplicationError.Forbidden('Wrong endpoint to update fbt survey')

  const isUniversitySurvey = survey.type === 'university'

  if (isUniversitySurvey && !user.isAdmin) throw ApplicationError.Forbidden('Only admins can update university survey')

  if (survey.type === 'programme') {
    const writeAccess = await checkUserWriteAccess(survey, user)
    if (!writeAccess) throw ApplicationError.Forbidden('User does not have write access to this survey')
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

const AtQuerySchema = z.object({
  at: z.iso
    .date()
    .or(z.iso.datetime({ offset: true }))
    .optional(),
})

const GetUniversitySurveyQuerySchema = z.object({
  at: z.iso.date().or(z.iso.datetime({ offset: true })),
})

const getUniversitySurvey = async (req: AuthenticatedRequest, res: Response) => {
  const { at: parsedAt } = GetUniversitySurveyQuerySchema.parse(req.query)
  const at = new Date(parsedAt)
  const survey = await _getUniversitySurvey(at)
  res.send(survey)
}

const CreateUniversitySurveyBodySchema = z.object({
  validFrom: z.iso.date().or(z.iso.datetime({ offset: true })),
})

const createUniversitySurvey = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user.isAdmin) throw ApplicationError.Forbidden('Only admins can create university survey versions')

  const { validFrom: validFromStr } = CreateUniversitySurveyBodySchema.parse(req.body)
  const validFrom = new Date(validFromStr)
  validFrom.setUTCHours(0, 0, 0, 0)

  if (validFrom <= new Date()) throw ApplicationError.BadRequest('validFrom must be in the future')

  const survey = await _createUniversitySurvey(validFrom)
  res.status(201).send(survey)
}

const getUniversitySurveyVersions = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user.isAdmin) throw ApplicationError.Forbidden('Only admins can list university survey versions')

  const surveys = await Survey.findAll({
    where: { type: 'university' },
    order: [sequelize.literal('"valid_from" DESC NULLS LAST')],
  })

  const now = new Date()
  const currentIndex = surveys.findIndex(s => !s.validFrom || s.validFrom <= now)
  const activeAndFuture = currentIndex === -1 ? surveys : surveys.slice(0, currentIndex + 1)

  await Promise.all(
    activeAndFuture.map(async s => {
      await s.populateQuestions()
      const numericQuestionIds = s.questions
        ?.filter(({ type }) => type === 'LIKERT' || type === 'SINGLE_CHOICE')
        .map(({ id }) => id)
      s.set('publicQuestionIds', numericQuestionIds)
    })
  )

  res.send(activeAndFuture)
}

const getFullOrganisationSurvey = async (req: AuthenticatedRequest, res: Response) => {
  const { organisationCode } = req.params
  const { at: parsedAt } = AtQuerySchema.parse(req.query)
  const at = parsedAt ? new Date(parsedAt) : new Date()

  const universitySurvey = await _getUniversitySurvey(at)
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

  const universitySurvey = await _getUniversitySurvey(new Date())

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
router.post('/university', createUniversitySurvey)
router.get('/university/versions', getUniversitySurveyVersions)
router.get('/university', getUniversitySurvey)
router.get('/organisation/:organisationCode', getFullOrganisationSurvey)
router.get('/programme/:surveyCode', getProgrammeSurveyForEditor)
