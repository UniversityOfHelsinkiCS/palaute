const { Router } = require('express')

const { LANGUAGES } = require('../../util/config')
const {
  CourseUnit,
  CourseRealisation,
  CourseUnitsOrganisation,
  CourseRealisationsOrganisation,
} = require('../../models')
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

  if (!hasAdminAccess) throw new ApplicationError(403, 'Only organisation admins can create organisation surveys')

  const organisationCourseUnit = await CourseUnit.create({
    courseCode: organisation.code,
    validityPeriod: {
      startDate,
      endDate,
    },
    name: organisation.name,
    userCreated: true,
  })

  const CuOrganisation = await CourseUnitsOrganisation.create({
    type: 'PRIMARY',
    courseUnitId: organisationCourseUnit.id,
    organisationId: organisation.id,
  })

  const organisationCourseRealisation = await CourseRealisation.create({
    endDate,
    startDate,
    name: organisation.name,
    teachingLanguages: LANGUAGES,
    userCreated: true,
  })

  const CurOrganisation = await CourseRealisationsOrganisation.create({
    type: 'PRIMARY',
    courseRealisationId: organisationCourseRealisation.id,
    organisationId: organisation.id,
  })

  return res.send({
    organisationCourseUnit,
    organisationCourseRealisation,
    CuOrganisation,
    CurOrganisation,
  })
}

const router = Router()

router.post('/:code/surveys', createOrganisationSurvey)

module.exports = router
