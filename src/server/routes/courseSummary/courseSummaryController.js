const { Router } = require('express')
const { addYears, format } = require('date-fns')

const { CourseUnit, Organisation } = require('../../models')

const { getOrganisationSummaries, getCourseRealisationSummaries } = require('../../services/summary')

const { ApplicationError } = require('../../util/customErrors')
const { sequelize } = require('../../db/dbConnection')
const { getSummaryQuestions } = require('../../services/questions')
const { updateCustomisation, getCustomisation } = require('./customisation')
const {
  getOrganisationSummaryWithChildOrganisations,
  getOrganisationSummaryWithCourseUnits,
  getOrganisationSummary,
  getTeacherSummary,
  getUserOrganisationSummaries,
  getOrganisationSummaryWithTags,
} = require('../../services/summary/summaryV2')
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

const getOrganisations = async (req, res) => {
  const { user } = req
  const { code } = req.params
  const { includeOpenUniCourseUnits, tagId, startDate, endDate } = req.query

  const [fullOrganisationAccess, accessibleCourseRealisationIds, questions] = await Promise.all([
    user.getOrganisationAccess(),
    // dont query users teached courses if code is defined (looking at one organisation)
    code ? [] : getAccessibleCourseRealisationIds(user),
    getSummaryQuestions(code),
  ])

  const organisationAccess = code
    ? fullOrganisationAccess.filter(org => org.organisation.code === code)
    : fullOrganisationAccess

  const parsedStartDate = startDate ? new Date(startDate) : null
  const defaultEndDate = parsedStartDate ? addYears(parsedStartDate, 1) : null
  const parsedEndDate = endDate ? new Date(endDate) : defaultEndDate

  const { averageRow, organisations } = await getOrganisationSummaries({
    user,
    questions,
    organisationAccess,
    accessibleCourseRealisationIds,
    includeOpenUniCourseUnits: includeOpenUniCourseUnits !== 'false',
    tagId,
    startDate: parsedStartDate,
    endDate: parsedEndDate,
  })

  return res.send({
    questions,
    organisations,
    averageRow,
  })
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
  const { startDate: startDateString, endDate: endDateString, entityId, include, tagId: tagIdString } = req.query
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
    })
  } else if (include === 'tags') {
    organisation = await getOrganisationSummaryWithTags({
      organisationId: entityId,
      startDate,
      endDate,
      user,
    })
  } else if (include === 'courseUnits') {
    organisation = await getOrganisationSummaryWithCourseUnits({
      organisationId: entityId,
      startDate,
      endDate,
      user,
      tagId,
    })
  } else {
    organisation = await getOrganisationSummary({
      organisationId: entityId,
      startDate,
      endDate,
      user,
    })
  }

  return res.send({ organisation })
}

const getByCourseUnit = async (req, res) => {
  const { user } = req
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

  const [organisationAccess, accessibleCourseRealisationIds, questions] = await Promise.all([
    user.dataValues.isAdmin || (await user.getOrganisationAccessByCourseUnitId(courseUnits[0].id))?.read,
    getAccessibleCourseRealisationIds(user),
    getSummaryQuestions(code),
  ])

  const courseRealisations = await getCourseRealisationSummaries({
    accessibleCourseRealisationIds,
    organisationAccess,
    courseCode: code,
    questions,
  })

  return res.send({
    questions,
    courseRealisations,
    courseUnit: courseUnits[0],
  })
}

const getCoursesV2 = async (req, res) => {
  const { startDate: startDateString, endDate: endDateString } = req.query
  const { user } = req

  const { startDate, endDate } = parseDates(startDateString, endDateString)

  const organisations = await getTeacherSummary({
    user,
    startDate,
    endDate,
  })

  return res.send(organisations)
}

const getUserOrganisationsV2 = async (req, res) => {
  const { startDate: startDateString, endDate: endDateString, viewingMode } = req.query
  const { user } = req

  const { startDate, endDate } = parseDates(startDateString, endDateString)

  const organisations = await getUserOrganisationSummaries({
    user,
    startDate,
    endDate,
    viewingMode,
  })

  res.send(organisations)
}

const router = Router()

router.get('/organisations', getOrganisations)
router.get('/organisations-v2', getOrganisationsV2)
router.get('/user-courses-v2', getCoursesV2)
router.get('/user-organisations-v2', getUserOrganisationsV2)
router.get('/organisations/:code', getOrganisations)
router.get('/course-units/:code', getByCourseUnit)
router.get('/customisation', getCustomisation)
router.put('/customisation', updateCustomisation)

module.exports = router
