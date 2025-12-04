import z from 'zod/v4'
import { Response, Router } from 'express'
import { format } from 'date-fns'
import { QueryTypes } from 'sequelize'

import { CourseUnit, Organisation, User } from '../../models'

import { ApplicationError } from '../../util/customErrors'
import { sequelize } from '../../db/dbConnection'
import { getSummaryQuestions } from '../../services/questions'
import {
  getOrganisationSummaryWithChildOrganisations,
  getOrganisationSummaryWithCourseUnits,
  getOrganisationSummary,
  getTeacherSummary,
  getUserOrganisationSummaries,
  getOrganisationSummaryWithTags,
  getCourseRealisationSummaries,
  getCourseUnitGroupSummaries,
  exportXLSX,
} from '../../services/summary'
import { startOfStudyYear, endOfStudyYear } from '../../util/common'
import { getOrganisationAccessByCourseUnitId } from '../../services/organisationAccess/organisationAccess'
import { AuthenticatedRequest } from '../../types'

const getAccessibleCourseRealisationIds = async (user: User) => {
  const rows = await sequelize.query<{ id: string }>(
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
      type: QueryTypes.SELECT,
    }
  )

  return rows.map(row => row.id)
}

/**
 * Parse dates from query parameters. If both dates are not valid, default to current study year
 */
const parseDates = (startDateString: string, endDateString: string) => {
  const parsedStartDate = Date.parse(startDateString)
  const parsedEndDate = Date.parse(endDateString)
  const hasDateRange = !Number.isNaN(parsedStartDate) && !Number.isNaN(parsedEndDate)
  const startDateObj = hasDateRange ? parsedStartDate : startOfStudyYear(new Date())
  const endDateObj = hasDateRange ? parsedEndDate : endOfStudyYear(new Date())

  return { startDate: format(startDateObj, 'yyyy-MM-dd'), endDate: format(endDateObj, 'yyyy-MM-dd') }
}

const DatesQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

const OrganisationsQuerySchema = DatesQuerySchema.extend({
  entityId: z.string(),
  include: z.enum(['childOrganisations', 'courseUnits', 'tags']).optional(),
  tagId: z.string().optional(),
  extraOrgId: z.string().optional(),
  extraOrgMode: z.enum(['include', 'exclude']).optional(),
})

/**
 * Get organisation summary, optionally with child organisations or course units
 */
const getOrganisationsV2 = async (req: AuthenticatedRequest, res: Response) => {
  const {
    startDate: startDateString,
    endDate: endDateString,
    entityId,
    include,
    tagId,
    extraOrgId,
    extraOrgMode,
  } = OrganisationsQuerySchema.parse(req.query)
  const { user } = req

  if (!entityId || typeof entityId !== 'string') {
    ApplicationError.BadRequest('Missing entityId')
    return
  }

  const { startDate, endDate } = parseDates(startDateString, endDateString)

  let organisation

  if (include === 'childOrganisations') {
    organisation = await getOrganisationSummaryWithChildOrganisations({
      organisationId: entityId,
      startDate,
      endDate,
      user,
      extraOrgId,
      extraOrgMode,
      accessibleOrganisationIds: undefined,
      universityWideAccess: undefined,
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

  res.send({ organisation })
}

const getByCourseUnit = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const { code } = req.params

  // There are course codes that include slash character (/), which is problematic in requests.
  // To avoid problems, course codes are encoded before attaching to request and must be decoded here before querying database.
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

  if (!courseUnits?.length) {
    ApplicationError.NotFound(`Course unit with code ${acualCode} not found`)
  }

  const [organisationAccess, accessibleCourseRealisationIds, questions] = await Promise.all([
    user.dataValues.isAdmin || (await getOrganisationAccessByCourseUnitId(user, courseUnits[0].id))?.read,
    getAccessibleCourseRealisationIds(user),
    getSummaryQuestions(acualCode),
  ])

  const courseRealisations = await getCourseRealisationSummaries({
    accessibleCourseRealisationIds,
    organisationAccess,
    courseCode: acualCode,
  })

  res.send({
    questions,
    courseRealisations,
    courseUnit: courseUnits[0],
  })
}

const CourseUnitGroupQuerySchema = DatesQuerySchema.extend({
  courseCode: z.string(),
  allTime: z.string().optional(),
})

const getCourseUnitGroup = async (req: AuthenticatedRequest, res: Response) => {
  const { user } = req
  const {
    courseCode,
    startDate: startDateString,
    endDate: endDateString,
    allTime: allTimeString,
  } = CourseUnitGroupQuerySchema.parse(req.query)
  const { startDate, endDate } = parseDates(startDateString, endDateString)
  const allTime = allTimeString === 'true'

  // There are course codes that include slash character (/), which is problematic in requests.
  // To avoid problems, course codes are encoded before attaching to request and must be decoded here before querying database.
  const acualCourseCode = decodeURIComponent(courseCode)

  const courseUnitGroup = await getCourseUnitGroupSummaries({
    user,
    courseCode: acualCourseCode,
    startDate,
    endDate,
    allTime,
  })

  res.send(courseUnitGroup)
}

const CoursesQuerySchema = DatesQuerySchema.extend({
  extraOrgId: z.string().optional(),
  extraOrgMode: z.enum(['include', 'exclude']).optional(),
})

const getCoursesV2 = async (req: AuthenticatedRequest, res: Response) => {
  const {
    startDate: startDateString,
    endDate: endDateString,
    extraOrgId,
    extraOrgMode,
  } = CoursesQuerySchema.parse(req.query)
  const { user } = req

  const { startDate, endDate } = parseDates(startDateString, endDateString)

  const organisations = await getTeacherSummary({
    user,
    startDate,
    endDate,
    extraOrgId,
    extraOrgMode,
  })

  res.send(organisations)
}

const UserOrganisationsQuerySchema = DatesQuerySchema.extend({
  viewingMode: z.enum(['tree', 'flat']).optional(),
  extraOrgId: z.string().optional(),
  extraOrgMode: z.enum(['include', 'exclude']).optional(),
})

const getUserOrganisationsV2 = async (req: AuthenticatedRequest, res: Response) => {
  const {
    startDate: startDateString,
    endDate: endDateString,
    viewingMode,
    extraOrgId,
    extraOrgMode,
  } = UserOrganisationsQuerySchema.parse(req.query)
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

const ExportXLSXQuerySchema = DatesQuerySchema.extend({
  includeOrgs: z.string().optional(),
  includeCUs: z.string().optional(),
  includeCURs: z.string().optional(),
  organisationId: z.string().optional(),
})

const getXLSX = async (req: AuthenticatedRequest, res: Response) => {
  const {
    startDate: startDateString,
    endDate: endDateString,
    includeOrgs: includeOrgsString,
    includeCUs: includeCUsString,
    includeCURs: includeCURsString,
    organisationId,
  } = ExportXLSXQuerySchema.parse(req.query)

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

export const router = Router()

router.get('/organisations-v2', getOrganisationsV2)
router.get('/user-courses-v2', getCoursesV2)
router.get('/user-organisations-v2', getUserOrganisationsV2)
router.get('/course-units/:code', getByCourseUnit)
router.get('/course-unit-group', getCourseUnitGroup)
router.get('/export-xlsx', getXLSX)
