const _ = require('lodash')
const { Router } = require('express')

const {
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
} = require('../../services/organisations/organisationSurveys')
const { getFeedbackTargetContext } = require('../../services/feedbackTargets/getFeedbackTargetContext')
const { validateStudentNumbers } = require('../../services/organisations/validator')
const { ApplicationError } = require('../../util/customErrors')
const { getAccessAndOrganisation } = require('./util')
const { createSummaryForFeedbackTarget } = require('../../services/summary/createSummary')
const { Summary } = require('../../models')

const getOrganisationSurvey = async (req, res) => {
  const { user } = req
  const { id } = req.params

  const { access, feedbackTarget } = await getFeedbackTargetContext({
    feedbackTargetId: id,
    user,
  })

  if (!access?.canSeePublicFeedbacks()) ApplicationError.Forbidden()

  if (!feedbackTarget) throw new Error('Organisation survey not found')

  const survey = await getSurveyById(feedbackTarget.id)

  return res.send(survey)
}

const getOrganisationSurveys = async (req, res) => {
  const { user } = req
  const { code } = req.params

  const { organisation, hasReadAccess } = await getAccessAndOrganisation(user, code)

  if (!hasReadAccess) {
    const teacherSurveys = await getSurveysForTeacher(code, user.id)

    return res.send(teacherSurveys)
  }

  const surveys = await getSurveysForOrganisation(organisation.id)

  return res.send(surveys)
}

const createOrganisationSurvey = async (req, res) => {
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

  if (!hasAdminAccess) throw new ApplicationError('Only organisation admins can create organisation surveys', 403)

  const studentDataFromCourseIds = await getOrganisationSurveyCourseStudents(courseRealisationIds)

  // Remove duplicates from studentNumbers and teacherIds
  const studentNumbers = [...new Set([...initialStudentNumbers])]
  const teacherIds = [...new Set(initialTeacherIds)]

  const { invalidStudentNumbers } = await validateStudentNumbers(studentNumbers)
  if (invalidStudentNumbers.length > 0) return res.status(400).send({ invalidStudentNumbers })

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

  return res.status(201).send({
    ...survey,
    userFeedbackTargets: [...studentFeedbackTargets, ...teacherFeedbackTargets],
  })
}

const editOrganisationSurvey = async (req, res) => {
  const { user, body } = req
  const { id } = req.params

  const updates = _.pick(body, ['name', 'startDate', 'endDate', 'teacherIds', 'studentNumbers', 'courseRealisationIds'])

  updates.studentNumbers = [...new Set([...updates.studentNumbers])]

  const { access, feedbackTarget } = await getFeedbackTargetContext({
    feedbackTargetId: id,
    user,
  })

  if (!access?.canUpdateOrganisationSurvey())
    return ApplicationError.Forbidden('Not allowed to update organisation survey')

  if (!feedbackTarget) throw new Error('Organisation survey not found')

  if (updates.studentNumbers) {
    const { invalidStudentNumbers } = await validateStudentNumbers(updates.studentNumbers)
    if (invalidStudentNumbers.length > 0) return res.status(400).send({ invalidStudentNumbers })
  }

  const updatedSurvey = await updateOrganisationSurvey(id, updates)

  // Update summary
  feedbackTarget.summary.data.studentCount = updatedSurvey.students.length
  await Summary.update(
    { data: feedbackTarget.summary.data },
    {
      where: {
        feedbackTargetId: feedbackTarget.id,
      },
    }
  )
  updatedSurvey.summary = feedbackTarget.summary

  return res.send(updatedSurvey)
}

const removeOrganisationSurvey = async (req, res) => {
  const { user } = req
  const { code, id } = req.params
  const { hasAdminAccess } = await getAccessAndOrganisation(user, code, {
    admin: true,
  })

  if (!hasAdminAccess) throw new ApplicationError('Only organisation admins can remove organisation surveys', 403)

  const allowDelete = await getDeletionAllowed(id)

  if (!hasAdminAccess && !allowDelete)
    throw new ApplicationError('Can not delete orgnanisation survey when feedbacks are given', 403)

  await deleteOrganisationSurvey(id)

  return res.status(204).send()
}

const router = Router()

router.get('/:code/surveys/:id', getOrganisationSurvey)
router.get('/:code/surveys', getOrganisationSurveys)
router.post('/:code/surveys', createOrganisationSurvey)
router.put('/:code/surveys/:id', editOrganisationSurvey)
router.delete('/:code/surveys/:id', removeOrganisationSurvey)

module.exports = router
