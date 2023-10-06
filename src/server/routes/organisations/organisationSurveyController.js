const { Router } = require('express')

const {
  initializeOrganisationCourseUnit,
  createOrganisationFeedbackTarget,
  createUserFeedbackTargets,
  getOrganisationSurvey,
  getSurveysForOrganisation,
} = require('../../services/organisations/organisationSurveys')
const { ApplicationError } = require('../../util/customErrors')
const { getAccessAndOrganisation } = require('./util')

const getOrganisationSurveys = async (req, res) => {
  const { user } = req
  const { code } = req.params

  if (!user.isAdmin) throw new ApplicationError(403, 'Only for admins during development')

  const { organisation, hasReadAccess } = await getAccessAndOrganisation(user, code, {
    read: true,
  })

  if (!hasReadAccess) throw new ApplicationError(403, 'No read access to organisation')

  const surveys = await getSurveysForOrganisation(organisation.id)

  return res.send(surveys)
}

const createOrganisationSurvey = async (req, res) => {
  const { user } = req
  const { code } = req.params
  const { name, startDate, endDate, studentNumbers } = req.body

  if (!user.isAdmin) throw new ApplicationError(403, 'Only for admins during development')

  const { organisation, hasAdminAccess } = await getAccessAndOrganisation(user, code, {
    admin: true,
  })

  if (!hasAdminAccess) throw new ApplicationError(403, 'Only organisation admins can create organisation surveys')

  await initializeOrganisationCourseUnit(organisation)

  const feedbackTarget = await createOrganisationFeedbackTarget(organisation, { name, startDate, endDate })

  const userFeedbackTargets = await createUserFeedbackTargets(feedbackTarget, studentNumbers)

  const survey = await getOrganisationSurvey(feedbackTarget.id)

  return res.status(201).send({
    ...survey.dataValues,
    userFeedbackTargets,
  })
}

const router = Router()

router.get('/:code/surveys', getOrganisationSurveys)
router.post('/:code/surveys', createOrganisationSurvey)

module.exports = router
