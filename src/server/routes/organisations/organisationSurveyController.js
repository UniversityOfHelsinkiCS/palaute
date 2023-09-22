const { Router } = require('express')
const { CourseUnit } = require('../../models')
const { ApplicationError } = require('../../util/customErrors')
const { getAccessAndOrganisation } = require('./util')

const createOrganisationSurvey = async (req, res) => {
  const { user } = req
  const { code } = req.params
  const { startDate, endDate } = req.body

  if (!user.isAdmin) throw new ApplicationError(403, 'Only for admins during development')

  const { organisation, hasAdminAccess } = await getAccessAndOrganisation(user, code, {
    admin: true,
  })

  if (!hasAdminAccess) throw new ApplicationError(403, 'Only admins can create organisation surveys')

  const organisationCourseUnit = await CourseUnit.create({
    courseCode: organisation.code,
    validityPeriod: {
      startDate,
      endDate,
    },
    name: organisation.name,
    userCreated: true,
  })

  return res.send(organisationCourseUnit)
}

const router = Router()

router.post('/:code/surveys', createOrganisationSurvey)

module.exports = router
