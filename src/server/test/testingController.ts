import Router, { Response } from 'express'
import _ from 'lodash'
import morgan from 'morgan'

import { FeedbackTarget } from '../models'

import { ApplicationError } from '../util/customErrors'
import { initTestSummary } from './seedSummary'
import { seedFeedbackTargetsForTeacher } from './seedFeedbackTargets'
import { seedDb, seedUsers, seedOrganisationCorrespondent } from './seed'
import { TEST_COURSE_REALISATION_ID } from './testIds'
import { inProduction } from '../util/config'
import { getUniversitySurvey } from '../services/surveys'
import { AuthenticatedRequest } from '../types'
import { seedFeedbacks } from './seedFeedbacks'

const initSummary = async (req: AuthenticatedRequest, res: Response) => {
  await initTestSummary({ user: _.pick(req.body, ['hyPersonSisuId', 'uid']) })
  res.send(200)
}

const userHeadersToUser = (userHeaders: any) => ({
  id: userHeaders.hyPersonSisuId,
  username: userHeaders.uid,
  firstName: userHeaders.givenname,
  lastName: userHeaders.sn,
  email: userHeaders.mail,
  studentNumber: userHeaders.studentNumber,
})

const seedTestUsers2 = async (req: AuthenticatedRequest, res: Response) => {
  const users = req.body.map(userHeadersToUser)
  await seedUsers(users)
  res.send(201)
}

const seedOrganisationCorrespondentHandler = async (req: AuthenticatedRequest, res: Response) => {
  const user = userHeadersToUser(req.body.user)
  await seedOrganisationCorrespondent(user)
  res.send(200)
}

const seedFeedbackTargets = async (req: AuthenticatedRequest, res: Response) => {
  const { teacher, student, opensAt, closesAt, extraStudents } = req.body
  const fbts = await seedFeedbackTargetsForTeacher({
    teacher: userHeadersToUser(teacher),
    student: userHeadersToUser(student),
    opensAt,
    closesAt,
    extraStudents,
  })
  res.send(fbts)
}

const resetDb = async (req: AuthenticatedRequest, res: Response) => {
  await seedDb()
  res.send(204)
}

const seedFeedbacksHandler = async (req: AuthenticatedRequest, res: Response) => {
  const { feedbackDatas } = req.body
  await seedFeedbacks(feedbackDatas)
  res.send(201)
}

const getTestFbtId = async (req: AuthenticatedRequest, res: Response) => {
  const fbt = await FeedbackTarget.findOne({
    where: {
      courseRealisationId: TEST_COURSE_REALISATION_ID,
    },
  })

  res.send({ id: fbt.id })
}

const getUniversityQuestions = async (req: AuthenticatedRequest, res: Response) => {
  const srv = await getUniversitySurvey()
  res.send(srv.questions)
}

export const router = Router()

// A double safeguard against running test routes in production. This should never happen.
router.use((__, ___, next) => {
  if (inProduction) {
    throw new ApplicationError('Test router called in production.', 500)
  }
  next()
})

router.use(Router.json())
router.use(morgan('dev'))

router.post('/init-summary', initSummary)
router.post('/seed-users', seedTestUsers2)
router.post('/seed-feedback-targets', seedFeedbackTargets)
router.post('/seed-feedbacks', seedFeedbacksHandler)
router.post('/seed-organisation-correspondent', seedOrganisationCorrespondentHandler)
router.post('/reset-db', resetDb)

router.get('/test-fbt-id', getTestFbtId)
router.get('/university-questions', getUniversityQuestions)
