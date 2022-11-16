const { Router } = require('express')
const { addYears } = require('date-fns')

const { CourseUnit, Organisation } = require('../../models')

const {
  getOrganisationSummaries,
  getCourseRealisationSummaries,
} = require('../../services/summary')

const { ApplicationError } = require('../../util/customErrors')
const { sequelize } = require('../../util/dbConnection')
const logger = require('../../util/logger')
const { getSummaryQuestions } = require('../../services/questions')
const getSummaryDefaultDateRange = require('../../services/summary/summaryDefaultDateRange')
const { updateCustomisation, getCustomisation } = require('./customisation')

const INCLUDED_ORGANISATIONS_BY_USER_ID = {
  // Jussi Merenmies
  'hy-hlo-1548120': ['300-M001'],
}

const filterOrganisationAccess = (organisationAccess, user) => {
  const includedOrganisationCodes = INCLUDED_ORGANISATIONS_BY_USER_ID[user.id]

  if (!includedOrganisationCodes) {
    return organisationAccess
  }

  return organisationAccess.filter(({ organisation }) =>
    includedOrganisationCodes.includes(organisation.code),
  )
}

const getAccessibleCourseRealisationIds = async (user) => {
  const rows = await sequelize.query(
    `
    SELECT DISTINCT ON (course_realisations.id) course_realisations.id
    FROM user_feedback_targets
    INNER JOIN feedback_targets ON user_feedback_targets.feedback_target_id = feedback_targets.id
    INNER JOIN course_realisations ON feedback_targets.course_realisation_id = course_realisations.id
    WHERE user_feedback_targets.user_id = :userId
    AND (user_feedback_targets.access_status = 'RESPONSIBLE_TEACHER' OR user_feedback_targets.access_status = 'TEACHER')
    AND feedback_targets.feedback_type = 'courseRealisation'
    AND course_realisations.start_date < NOW()
    AND course_realisations.start_date > NOW() - interval '16 months';
  `,
    {
      replacements: {
        userId: user.id,
      },
      type: sequelize.QueryTypes.SELECT,
    },
  )

  return rows.map((row) => row.id)
}

const getAccessInfo = async (req, res) => {
  const { user } = req

  // shortcut for most students
  if (user.iamGroups.length === 0 && !req.headers.employeenumber) {
    return res.send({
      accessible: false,
      adminAccess: false,
      defaultDateRange: null,
    })
  }

  const [organisationAccess, accessibleCourseRealisationIds] =
    await Promise.all([
      user.getOrganisationAccess(),
      getAccessibleCourseRealisationIds(user),
    ])

  const adminAccess = !!organisationAccess.find((org) => org.access.admin)

  const accessible =
    organisationAccess.length > 0 || accessibleCourseRealisationIds.length > 0

  const defaultDateRange = accessible
    ? await getSummaryDefaultDateRange({
        user,
        organisationAccess,
      })
    : null

  // For grafana statistics
  if (organisationAccess.length === 1) {
    const { name, code } = organisationAccess[0].organisation.dataValues
    logger.info('Organisation access', {
      organisationName: name.fi,
      organisationCode: code,
    })
  }

  return res.send({
    accessible,
    adminAccess,
    defaultDateRange,
  })
}

const getOrganisations = async (req, res) => {
  const { user } = req
  const { code } = req.params
  const { includeOpenUniCourseUnits, tagId, startDate, endDate } = req.query

  const [fullOrganisationAccess, accessibleCourseRealisationIds, questions] =
    await Promise.all([
      user.getOrganisationAccess(),
      // dont query users teached courses if code is defined (looking at one organisation)
      code ? [] : getAccessibleCourseRealisationIds(user),
      getSummaryQuestions(code),
    ])

  const organisationAccess = code
    ? fullOrganisationAccess.filter((org) => org.organisation.code === code)
    : fullOrganisationAccess

  if (
    organisationAccess.length === 0 &&
    accessibleCourseRealisationIds.length === 0
  ) {
    throw new ApplicationError('Forbidden', 403)
  }

  const parsedStartDate = startDate ? new Date(startDate) : null
  const defaultEndDate = parsedStartDate ? addYears(parsedStartDate, 1) : null
  const parsedEndDate = endDate ? new Date(endDate) : defaultEndDate

  const organisations = await getOrganisationSummaries({
    user,
    questions,
    organisationAccess: filterOrganisationAccess(organisationAccess, user),
    accessibleCourseRealisationIds,
    includeOpenUniCourseUnits: includeOpenUniCourseUnits !== 'false',
    tagId,
    startDate: parsedStartDate,
    endDate: parsedEndDate,
  })

  return res.send({
    questions,
    organisations,
  })
}

const getByCourseUnit = async (req, res) => {
  const { user } = req
  const { silent } = req.query
  const { code } = req.params

  const courseUnits = await CourseUnit.findAll({
    where: { courseCode: code },
    include: [
      {
        model: Organisation,
        attributes: ['id'],
        as: 'organisations',
      },
    ],
    order: [['updated_at', 'DESC']],
  })

  if (!courseUnits?.length > 0) {
    throw new ApplicationError('Course unit is not found', 404)
  }

  const [organisationAccess, accessibleCourseRealisationIds, questions] =
    await Promise.all([
      user.isAdmin ||
        (
          await user.getOrganisationAccessByCourseUnitId(courseUnits[0].id)
        )?.read,
      getAccessibleCourseRealisationIds(user),
      getSummaryQuestions(code),
    ])

  const courseRealisations = await getCourseRealisationSummaries({
    accessibleCourseRealisationIds,
    organisationAccess,
    courseCode: code,
    questions,
  })

  if (courseRealisations.length === 0) {
    if (silent !== 'true') {
      throw new ApplicationError('Forbidden', 403)
    } else {
      return res.send(null)
    }
  }

  return res.send({
    questions,
    courseRealisations,
    courseUnit: courseUnits[0],
  })
}

const router = Router()

router.get('/organisations', getOrganisations)
router.get('/organisations/:code', getOrganisations)
router.get('/course-units/:code', getByCourseUnit)
router.get('/access', getAccessInfo)
router.get('/customisation', getCustomisation)
router.put('/customisation', updateCustomisation)

module.exports = router
