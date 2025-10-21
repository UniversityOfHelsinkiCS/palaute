const { Router } = require('express')
const { format } = require('date-fns')

const { CourseUnit, Organisation } = require('../../models')

const { ApplicationError } = require('../../util/customErrors')
const { sequelize } = require('../../db/dbConnection')
const { getSummaryQuestions } = require('../../services/questions')
const {
  getOrganisationSummaryWithChildOrganisations,
  getOrganisationSummaryWithCourseUnits,
  getOrganisationSummary,
  getTeacherSummary,
  getUserOrganisationSummaries,
  getOrganisationSummaryWithTags,
  getCourseRealisationSummaries,
  getCourseUnitGroupSummaries,
  exportXLSX,
} = require('../../services/summary')
const { startOfStudyYear, endOfStudyYear } = require('../../util/common')

const getAccessibleCourseRealisationIds = async user => {
  const rows = await sequelize.query(
    `
    SELECT DISTINCT ON (course_realisations.id) course_realisations.id
    FROM user_feedback_targets
    INNER JOIN feedback_targets ON user_feedback_targets.feedback_target_id = feedback_targets.id
    INNER JOIN course_realisations ON feedback_targets.course_realisation_id = course_realisations.id
    WHERE user_feedback_targets.user_id = :userId
    AND is_teacher(user_feedback_targets.access_status)
    AND feedback_targets.feedback_type = 'courseRealisation'
    AND course_realisations.start_date > NOW() - interval '24 months';
  `,
    {
      replacements: {
        userId: user.id,
      },
      type: sequelize.QueryTypes.SELECT,
    }
  )

  return rows.map(row => row.id)
}

/**
 * Parse dates from query parameters. If both dates are not valid, default to current study year
 */
const parseDates = (startDateString, endDateString) => {
  const parsedStartDate = Date.parse(startDateString)
  const parsedEndDate = Date.parse(endDateString)
  const hasDateRange = !Number.isNaN(parsedStartDate) && !Number.isNaN(parsedEndDate)
  const startDateObj = hasDateRange ? parsedStartDate : startOfStudyYear(new Date())
  const endDateObj = hasDateRange ? parsedEndDate : endOfStudyYear(new Date())

  return { startDate: format(startDateObj, 'yyyy-MM-dd'), endDate: format(endDateObj, 'yyyy-MM-dd') }
}

/**
 * Get organisation summary, optionally with child organisations or course units
 */
const getOrganisationsV2 = async (req, res) => {
  const {
    startDate: startDateString,
    endDate: endDateString,
    entityId,
    include,
    tagId: tagIdString,
    extraOrgId,
    extraOrgMode,
  } = req.query
  const { user } = req

  if (!entityId) {
    return ApplicationError.BadRequest('Missing entityId')
  }

  const { startDate, endDate } = parseDates(startDateString, endDateString)
  const tagId = tagIdString ? parseInt(tagIdString, 10) : null

  let organisation

  if (include === 'childOrganisations') {
    organisation = await getOrganisationSummaryWithChildOrganisations({
      organisationId: entityId,
      startDate,
      endDate,
      user,
      extraOrgId,
      extraOrgMode,
    })
  } else if (include === 'tags') {
    organisation = await getOrganisationSummaryWithTags({
      organisationId: entityId,
      startDate,
      endDate,
      user,
      extraOrgId,
      extraOrgMode,
    })
  } else if (include === 'courseUnits') {
    organisation = await getOrganisationSummaryWithCourseUnits({
      organisationId: entityId,
      startDate,
      endDate,
      user,
      tagId,
      extraOrgId,
      extraOrgMode,
    })
  } else {
    organisation = await getOrganisationSummary({
      organisationId: entityId,
      startDate,
      endDate,
      user,
      extraOrgId,
      extraOrgMode,
    })
  }

  return res.send({ organisation })
}

const getByCourseUnit = async (req, res) => {
  const { user } = req
  const { code } = req.params

  // There are course codes that include slash character (/), which is problematic in URLs.
  // To avoid problems, course codes are encoded before attaching to URL and must be deboded here before querying database.
  const acualCode = decodeURIComponent(code)

  const courseUnits = await CourseUnit.findAll({
    where: { courseCode: acualCode },
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

  const [organisationAccess, accessibleCourseRealisationIds, questions] = await Promise.all([
    user.dataValues.isAdmin || (await user.getOrganisationAccessByCourseUnitId(courseUnits[0].id))?.read,
    getAccessibleCourseRealisationIds(user),
    getSummaryQuestions(acualCode),
  ])

  const courseRealisations = await getCourseRealisationSummaries({
    accessibleCourseRealisationIds,
    organisationAccess,
    courseCode: acualCode,
    questions,
  })

  return res.send({
    questions,
    courseRealisations,
    courseUnit: courseUnits[0],
  })
}

const getCourseUnitGroup = async (req, res) => {
  const { user } = req
  const { courseCode, startDate: startDateString, endDate: endDateString, allTime: allTimeString } = req.query
  const { startDate, endDate } = parseDates(startDateString, endDateString)
  const allTime = allTimeString === 'true'

  // There are course codes that include slash character (/), which is problematic in URLs.
  // To avoid problems, course codes are encoded before attaching to URL and must be deboded here before querying database.
  const acualCourseCode = decodeURIComponent(courseCode)

  const courseUnitGroup = await getCourseUnitGroupSummaries({
    user,
    courseCode: acualCourseCode,
    startDate,
    endDate,
    allTime,
  })

  return res.send(courseUnitGroup)
}

const getCoursesV2 = async (req, res) => {
  const { startDate: startDateString, endDate: endDateString, extraOrgId, extraOrgMode } = req.query
  const { user } = req

  const { startDate, endDate } = parseDates(startDateString, endDateString)

  const organisations = await getTeacherSummary({
    user,
    startDate,
    endDate,
    extraOrgId,
    extraOrgMode,
  })

  return res.send(organisations)
}

const getUserOrganisationsV2 = async (req, res) => {
  const { startDate: startDateString, endDate: endDateString, viewingMode, extraOrgId, extraOrgMode } = req.query
  const { user } = req

  const { startDate, endDate } = parseDates(startDateString, endDateString)

  const organisations = await getUserOrganisationSummaries({
    user,
    startDate,
    endDate,
    viewingMode,
    extraOrgId,
    extraOrgMode,
  })

  res.send(organisations)
}

const getXLSX = async (req, res) => {
  const {
    startDate: startDateString,
    endDate: endDateString,
    includeOrgs: includeOrgsString,
    includeCUs: includeCUsString,
    includeCURs: includeCURsString,
    organisationId,
  } = req.query

  const { user } = req

  const { startDate, endDate } = parseDates(startDateString, endDateString)

  const { xlsxFile, fileName } = await exportXLSX({
    user,
    startDate,
    endDate,
    includeOrgs: includeOrgsString === 'true',
    includeCUs: includeCUsString === 'true',
    includeCURs: includeCURsString === 'true',
    organisationId,
  })

  res.writeHead(200, [
    ['Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ['Content-Disposition', `attachment; filename=${fileName}`],
  ])
  res.end(xlsxFile)
}

const router = Router()

router.get('/organisations-v2', getOrganisationsV2)
router.get('/user-courses-v2', getCoursesV2)
router.get('/user-organisations-v2', getUserOrganisationsV2)
router.get('/course-units/:code', getByCourseUnit)
router.get('/course-unit-group', getCourseUnitGroup)
router.get('/export-xlsx', getXLSX)

module.exports = router
