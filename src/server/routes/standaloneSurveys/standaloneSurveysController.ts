import type { QuestionAnswer } from '@common/types/question'

import { Response, Router } from 'express'
import z from 'zod/v4'

import { adminAccess } from '../../middleware/adminAccess'
import { STANDALONE_QUESTION_VISIBILITIES } from '../../models/standaloneSurveyQuestion'
import { assertCanManage, getAccess } from '../../services/standaloneSurveys/access'
import {
  getPublicQuestionIds,
  getQuestions,
  getResponsibleUsers,
  getSurveyById,
  getSurveyByToken,
} from '../../services/standaloneSurveys/getSurvey'
import { getLogs } from '../../services/standaloneSurveys/logs'
import { hideAnswers, deleteAnswers } from '../../services/standaloneSurveys/openAnswers'
import {
  canSeePublicResults,
  deleteResponse,
  getOwnResponse,
  getResults,
  saveResponse,
} from '../../services/standaloneSurveys/responses'
import {
  createSurvey,
  deleteSurvey,
  getAllSurveys,
  getSurveysForResponsibleUser,
  setResponsibleUsers,
  updateSurvey,
} from '../../services/standaloneSurveys/surveys'
import { updateQuestions } from '../../services/standaloneSurveys/updateQuestions'
import { AuthenticatedRequest } from '../../types'
import { ApplicationError } from '../../util/ApplicationError'

const parse = <T extends z.ZodType>(schema: T, value: unknown): z.infer<T> => {
  const result = schema.safeParse(value)
  if (!result.success) throw ApplicationError.BadRequest(z.prettifyError(result.error))
  return result.data
}

const LocalizedStringSchema = z.object({
  fi: z.string().optional(),
  sv: z.string().optional(),
  en: z.string().optional(),
})

const CreateBodySchema = z.object({
  name: LocalizedStringSchema,
  opensAt: z.coerce.date(),
  closesAt: z.coerce.date(),
  responsibleUserIds: z.array(z.string()).min(1),
})

const UpdateBodySchema = z.object({
  name: LocalizedStringSchema.optional(),
  opensAt: z.coerce.date().optional(),
  closesAt: z.coerce.date().optional(),
})

const QuestionsBodySchema = z.object({
  questions: z.array(
    z.object({
      id: z.number().int().optional(),
      type: z.enum(['TEXT', 'LIKERT', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'OPEN']),
      required: z.boolean(),
      data: z.record(z.string(), z.any()),
      visibility: z.enum(STANDALONE_QUESTION_VISIBILITIES),
    })
  ),
})

const ResponsibleUsersBodySchema = z.object({ userIds: z.array(z.string()).min(1) })

const ResponseBodySchema = z.object({
  data: z.array(z.object({ questionId: z.number().int(), data: z.union([z.string(), z.array(z.string())]) })),
})

const OpenAnswerBodySchema = z.object({ questionId: z.number().int(), content: z.string() })

const getId = (req: AuthenticatedRequest) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) throw ApplicationError.BadRequest('Invalid id')
  return id
}

const getManagedSurvey = async (req: AuthenticatedRequest) => {
  const survey = await getSurveyById(getId(req))
  const access = assertCanManage(survey, req.user)
  return { survey, access }
}

const toManagementJson = (survey: Awaited<ReturnType<typeof getSurveyById>>, access: ReturnType<typeof getAccess>) => ({
  id: survey.id,
  name: survey.name,
  token: survey.token,
  opensAt: survey.opensAt,
  closesAt: survey.closesAt,
  createdAt: survey.createdAt,
  questions: getQuestions(survey),
  publicQuestionIds: getPublicQuestionIds(survey),
  responsibleUsers: getResponsibleUsers(survey),
  access,
})

const router = Router()

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  res.send(await getSurveysForResponsibleUser(req.user))
})

router.get('/all', adminAccess, async (_req: AuthenticatedRequest, res: Response) => {
  res.send(await getAllSurveys())
})

router.post('/', adminAccess, async (req: AuthenticatedRequest, res: Response) => {
  const body = parse(CreateBodySchema, req.body)
  const survey = await createSurvey({ ...body, user: req.user })
  res.status(201).send({ id: survey.id })
})

router.get('/answer/:token', async (req: AuthenticatedRequest, res: Response) => {
  const survey = await getSurveyByToken(req.params.token)
  const response = await getOwnResponse(survey, req.user)
  const { canManage } = getAccess(survey, req.user)

  res.send({
    id: canManage ? survey.id : undefined,
    name: survey.name,
    opensAt: survey.opensAt,
    closesAt: survey.closesAt,
    questions: getQuestions(survey),
    publicQuestionIds: getPublicQuestionIds(survey),
    response: response ? { data: response.data } : null,
    resultsVisible: canSeePublicResults(survey, !!response),
  })
})

router.put('/answer/:token/response', async (req: AuthenticatedRequest, res: Response) => {
  const { data } = parse(ResponseBodySchema, req.body)
  const survey = await getSurveyByToken(req.params.token)
  const response = await saveResponse(survey, req.user, data as QuestionAnswer[])
  res.send({ data: response.data })
})

router.delete('/answer/:token/response', async (req: AuthenticatedRequest, res: Response) => {
  const survey = await getSurveyByToken(req.params.token)
  await deleteResponse(survey, req.user)
  res.sendStatus(204)
})

router.get('/answer/:token/results', async (req: AuthenticatedRequest, res: Response) => {
  const survey = await getSurveyByToken(req.params.token)
  const response = await getOwnResponse(survey, req.user)
  if (!canSeePublicResults(survey, !!response)) throw ApplicationError.Forbidden('Results are not visible yet')

  res.send(await getResults(survey, { publicOnly: true }))
})

router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { survey, access } = await getManagedSurvey(req)
  res.send(toManagementJson(survey, access))
})

router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const body = parse(UpdateBodySchema, req.body)
  const { survey } = await getManagedSurvey(req)
  await updateSurvey(survey, body, req.user)
  const updated = await getSurveyById(survey.id)
  res.send(toManagementJson(updated, getAccess(updated, req.user)))
})

router.delete('/:id', adminAccess, async (req: AuthenticatedRequest, res: Response) => {
  const survey = await getSurveyById(getId(req))
  await deleteSurvey(survey)
  res.sendStatus(204)
})

router.put('/:id/questions', async (req: AuthenticatedRequest, res: Response) => {
  const { questions } = parse(QuestionsBodySchema, req.body)
  const { survey } = await getManagedSurvey(req)
  await updateQuestions(survey, questions as any, req.user)
  const updated = await getSurveyById(survey.id)
  res.send(toManagementJson(updated, getAccess(updated, req.user)))
})

router.put('/:id/responsible-users', async (req: AuthenticatedRequest, res: Response) => {
  const { userIds } = parse(ResponsibleUsersBodySchema, req.body)
  const { survey } = await getManagedSurvey(req)
  await setResponsibleUsers(survey, userIds, req.user)
  const updated = await getSurveyById(survey.id)
  res.send(toManagementJson(updated, getAccess(updated, req.user)))
})

router.get('/:id/results', async (req: AuthenticatedRequest, res: Response) => {
  const { survey } = await getManagedSurvey(req)
  res.send(await getResults(survey, { publicOnly: false }))
})

router.put('/:id/hide-answer', async (req: AuthenticatedRequest, res: Response) => {
  const { questionId, content, hidden } = parse(OpenAnswerBodySchema.extend({ hidden: z.boolean() }), req.body)
  const { survey } = await getManagedSurvey(req)
  res.send({ count: await hideAnswers(survey, questionId, content, hidden) })
})

router.put('/:id/delete-answer', adminAccess, async (req: AuthenticatedRequest, res: Response) => {
  const { questionId, content } = parse(OpenAnswerBodySchema, req.body)
  const survey = await getSurveyById(getId(req))
  res.send({ count: await deleteAnswers(survey, questionId, content) })
})

router.get('/:id/logs', async (req: AuthenticatedRequest, res: Response) => {
  const { survey } = await getManagedSurvey(req)
  res.send(await getLogs(survey.id))
})

export { router as standaloneSurveysRouter }
