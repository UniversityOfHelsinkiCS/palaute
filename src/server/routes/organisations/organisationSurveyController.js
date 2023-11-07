const _ = require('lodash')
const { Router } = require('express')

const {
  initializeOrganisationCourseUnit,
  createOrganisationFeedbackTarget,
  createUserFeedbackTargets,
  getOrganisationSurvey,
  getSurveysForOrganisation,
  updateOrganisationSurvey,
  deleteOrganisationSurvey,
  getDeletionAllowed,
} = require('../../services/organisations/organisationSurveys')
const { validateStudentNumbers } = require('../../services/organisations/validator')
const { ApplicationError } = require('../../util/customErrors')
const { getAccessAndOrganisation } = require('./util')

const getOrganisationSurveys = async (req, res) => {
  const { user } = req
  const { code } = req.params

  const { organisation, hasReadAccess } = await getAccessAndOrganisation(user, code, {
    read: true,
  })

  if (!hasReadAccess) throw new ApplicationError('No read access to organisation', 403)

  const surveys = await getSurveysForOrganisation(organisation.id)

  return res.send(surveys)
}

const createOrganisationSurvey = async (req, res) => {
  const { user } = req
  const { code } = req.params
  const { name, startDate, endDate, studentNumbers, teacherIds } = req.body

  const { organisation, hasAdminAccess } = await getAccessAndOrganisation(user, code, {
    admin: true,
  })

  if (!hasAdminAccess) throw new ApplicationError('Only organisation admins can create organisation surveys', 403)

  const { invalidStudentNumbers } = await validateStudentNumbers(studentNumbers)
  if (invalidStudentNumbers.length > 0) return res.status(400).send({ invalidStudentNumbers })

  await initializeOrganisationCourseUnit(organisation)

  const feedbackTarget = await createOrganisationFeedbackTarget(organisation, { name, startDate, endDate })

  const userFeedbackTargets = await createUserFeedbackTargets(feedbackTarget, studentNumbers, teacherIds)

  const survey = await getOrganisationSurvey(feedbackTarget.id)

  return res.status(201).send({
    ...survey.dataValues,
    userFeedbackTargets,
  })
}

const editOrganisationSurvey = async (req, res) => {
  const { user, body } = req
  const { code, id } = req.params

  const updates = _.pick(body, ['name', 'startDate', 'endDate', 'teacherIds', 'studentNumbers'])

  const { hasAdminAccess } = await getAccessAndOrganisation(user, code, {
    admin: true,
  })

  if (!hasAdminAccess) throw new ApplicationError('Only organisation admins can update organisation surveys', 403)

  if (updates.studentNumbers) {
    const { invalidStudentNumbers } = await validateStudentNumbers(updates.studentNumbers)
    if (invalidStudentNumbers.length > 0) return res.status(400).send({ invalidStudentNumbers })
  }

  const updatedSurvey = await updateOrganisationSurvey(id, updates)

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

  if (!allowDelete) throw new ApplicationError('Can not delete orgnanisation survey when feedbacks are given', 403)

  await deleteOrganisationSurvey(id)

  return res.status(204).send()
}

const router = Router()

router.get('/:code/surveys', getOrganisationSurveys)
router.post('/:code/surveys', createOrganisationSurvey)
router.put('/:code/surveys/:id', editOrganisationSurvey)
router.delete('/:code/surveys/:id', removeOrganisationSurvey)

module.exports = router
