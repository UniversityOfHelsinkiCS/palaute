import _ from 'lodash'
import { Response, Router } from 'express'

import {
  initializeOrganisationCourseUnit,
  createOrganisationFeedbackTarget,
  createUserFeedbackTargets,
  getStudentIds,
  getSurveyById,
  getSurveysForOrganisation,
  getSurveysForTeacher,
  updateOrganisationSurvey,
  deleteOrganisationSurvey,
  getDeletionAllowed,
  getOrganisationSurveyCourseStudents,
  createOrganisationSurveyCourses,
} from '../../services/organisations/organisationSurveys'
import { getFeedbackTargetContext } from '../../services/feedbackTargets/getFeedbackTargetContext'
import { validateStudentNumbers } from '../../services/organisations/validator'
import { ApplicationError } from '../../util/ApplicationError'
import { getAccessAndOrganisation } from './util'
import { createSummaryForFeedbackTarget } from '../../services/summary/createSummary'
import { updateSummaryOnOrganisationSurveyEdit } from '../../services/summary/updateSummaryOnOrganisationSurveyEdit'
import { getUserOrganisationAccess } from '../../services/organisationAccess/organisationAccess'
import { AuthenticatedRequest } from '../../types'

const getOrganisationSurvey = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const { id } = req.params

  const { access, feedbackTarget } = await getFeedbackTargetContext({
    feedbackTargetId: id,
    user,
  })

  if (!access?.canSeePublicFeedbacks()) ApplicationError.Forbidden()

  const survey = await getSurveyById(feedbackTarget.id)

  res.send(survey)
}

const getOrganisationSurveys = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const { code } = req.params

  const { organisation, hasReadAccess } = await getAccessAndOrganisation(user, code)

  if (!hasReadAccess) {
    const teacherSurveys = await getSurveysForTeacher(code, user.id)

    res.send(teacherSurveys)
    return
  }

  const surveys = await getSurveysForOrganisation(organisation.id)

  res.send(surveys)
}

const createOrganisationSurvey = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const { code } = req.params
  const {
    name,
    startDate,
    endDate,
    studentNumbers: initialStudentNumbers,
    teacherIds: initialTeacherIds,
    courseRealisationIds,
  } = req.body

  const { organisation, hasAdminAccess } = await getAccessAndOrganisation(user, code, {
    admin: true,
  })

  if (!hasAdminAccess) ApplicationError.Forbidden('Only organisation admins can create organisation surveys')

  const studentDataFromCourseIds = await getOrganisationSurveyCourseStudents(courseRealisationIds)

  // Remove duplicates from studentNumbers and teacherIds
  const studentNumbers = [...new Set([...initialStudentNumbers])]
  const teacherIds = [...new Set(initialTeacherIds)] as string[]

  const { invalidStudentNumbers } = await validateStudentNumbers(studentNumbers)
  if (invalidStudentNumbers.length > 0) {
    res.status(400).send({ invalidStudentNumbers })
    return
  }

  await initializeOrganisationCourseUnit(organisation)

  const feedbackTarget = await createOrganisationFeedbackTarget(organisation, {
    name,
    startDate,
    endDate,
  })

  const studentIdsFromStudentNumbers = await getStudentIds(studentNumbers)
  const studentIds = [...studentIdsFromStudentNumbers, ...studentDataFromCourseIds.map(n => n.id)]
  const studentFeedbackTargets = await createUserFeedbackTargets(feedbackTarget.id, studentIds, 'STUDENT')
  const teacherFeedbackTargets = await createUserFeedbackTargets(feedbackTarget.id, teacherIds, 'RESPONSIBLE_TEACHER')

  await createOrganisationSurveyCourses(feedbackTarget.id, studentDataFromCourseIds)

  // Create summary for the new feedback target
  await createSummaryForFeedbackTarget(feedbackTarget.id, studentFeedbackTargets.length, startDate, endDate)

  const survey = await getSurveyById(feedbackTarget.id)

  res.status(201).send({
    ...survey,
    userFeedbackTargets: [...studentFeedbackTargets, ...teacherFeedbackTargets],
  })
}

const editOrganisationSurvey = async (req: AuthenticatedRequest, res: Response) => {
  const { user, body } = req
  const { id } = req.params
  const feedbackTargetId = Number(id)

  const { access, feedbackTarget } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })

  if (!access?.canUpdateOrganisationSurvey()) ApplicationError.Forbidden('Not allowed to update organisation survey')

  if (!feedbackTarget.userCreated) ApplicationError.BadRequest(`Feedback target ${id} is not an organisation survey`)

  const updates = _.pick(body, ['name', 'startDate', 'endDate', 'teacherIds', 'studentNumbers', 'courseRealisationIds'])

  updates.studentNumbers = [...new Set([...updates.studentNumbers])]

  if (updates.studentNumbers) {
    const { invalidStudentNumbers } = await validateStudentNumbers(updates.studentNumbers)
    if (invalidStudentNumbers.length > 0) {
      res.status(400).send({ invalidStudentNumbers })
      return
    }
  }

  const updatedSurvey = await updateOrganisationSurvey(feedbackTargetId, updates)
  const updatedStudentCount =
    updatedSurvey.students.independentStudents.length + updatedSurvey.students.courseStudents.length

  const updatedSummary = await updateSummaryOnOrganisationSurveyEdit(feedbackTarget.id, updatedStudentCount)

  updatedSurvey.summary = updatedSummary

  res.send(updatedSurvey)
}

const removeOrganisationSurvey = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const { code, id } = req.params
  const feedbackTargetId = Number(id)
  const { hasAdminAccess } = await getAccessAndOrganisation(user, code, {
    admin: true,
  })

  if (!hasAdminAccess) ApplicationError.Forbidden('Only organisation admins can remove organisation surveys')

  const { feedbackTarget } = await getFeedbackTargetContext({
    feedbackTargetId,
    user,
  })

  if (!feedbackTarget.userCreated) ApplicationError.BadRequest(`Feedback target ${id} is not an organisation survey`)

  const allowDelete = await getDeletionAllowed(feedbackTargetId)

  if (!hasAdminAccess && !allowDelete)
    ApplicationError.Forbidden('Can not delete orgnanisation survey when feedbacks are given')

  await deleteOrganisationSurvey(feedbackTargetId)

  res.status(204).send()
}

const getOrganisationSurveysForUser = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const organisationAccess = await getUserOrganisationAccess(user)
  const organisationSurveys = await Promise.all(
    organisationAccess
      .filter(organisationAccess => organisationAccess.access.admin)
      .map(async organisationAccess => {
        const surveys = await getSurveysForOrganisation(organisationAccess.organisation.id)
        return { organisation: organisationAccess.organisation, surveys }
      })
  )

  res.send(organisationSurveys)
}

export const router = Router()

router.get('/surveys-for-user', getOrganisationSurveysForUser)
router.get('/:code/surveys/:id', getOrganisationSurvey)
router.get('/:code/surveys', getOrganisationSurveys)
router.post('/:code/surveys', createOrganisationSurvey)
router.put('/:code/surveys/:id', editOrganisationSurvey)
router.delete('/:code/surveys/:id', removeOrganisationSurvey)
