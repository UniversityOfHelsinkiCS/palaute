const { Router } = require('express')

const { initializeOrganisationCourseUnit } = require('../../services/organisations/organisationSurveys')
const { ApplicationError } = require('../../util/customErrors')
const { getAccessAndOrganisation } = require('./util')

const createOrganisationSurvey = async (req, res) => {
  const { user } = req
  const { code } = req.params

  if (!user.isAdmin) throw new ApplicationError(403, 'Only for admins during development')

  const { organisation, hasAdminAccess } = await getAccessAndOrganisation(user, code, {
    admin: true,
  })

  if (!hasAdminAccess) throw new ApplicationError(403, 'Only organisation admins can create organisation surveys')

  await initializeOrganisationCourseUnit(organisation)

  return res.sendStatus(201)
}

const router = Router()

router.post('/:code/surveys', createOrganisationSurvey)

module.exports = router
