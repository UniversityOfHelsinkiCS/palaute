const _ = require('lodash')
const {
  CourseUnit,
  FeedbackTarget,
  CourseRealisation,
  CourseRealisationsOrganisation,
  CourseUnitsOrganisation,
  UserFeedbackTarget,
  User,
} = require('../../models')
const { sumSummaries, getScopedSummary } = require('./utils')
const { getAccessibleCourseRealisationIds } = require('./access')
const { ApplicationError } = require('../../util/customErrors')

const getCourseUnitGroupSummaries = async ({ user, courseCode, startDate, endDate, allTime }) => {
  const orgAccess = await user.getOrganisationAccess()
  const accessibleCurIds = await getAccessibleCourseRealisationIds(user)
  const scopedSummary = getScopedSummary({ startDate, endDate, allTime })

  // Early exit for students, "DOS prevention" :D
  if (Object.keys(orgAccess).length === 0 && accessibleCurIds.length === 0)
    return ApplicationError.Forbidden('No access')

  const courseUnits = await CourseUnit.findAll({
    where: {
      courseCode,
    },
    include: [
      {
        model: CourseUnitsOrganisation,
        as: 'courseUnitsOrganisations',
        attributes: ['organisationId'],
      },
      {
        model: scopedSummary,
        as: 'groupSummaries',
      },
      {
        model: FeedbackTarget,
        as: 'feedbackTargets',
        attributes: ['id', 'feedbackResponse', 'feedbackResponseEmailSent'],
        separate: true,
        include: [
          {
            model: CourseRealisation,
            as: 'courseRealisation',
            required: true,
            include: [
              {
                model: CourseRealisationsOrganisation,
                as: 'courseRealisationsOrganisations',
                attributes: ['organisationId'],
              },
              {
                model: scopedSummary,
                as: 'summary',
                required: true,
              },
            ],
          },
          {
            model: UserFeedbackTarget.scope('teachers'),
            attributes: ['userId', 'accessStatus', 'isAdministrativePerson'],
            as: 'userFeedbackTargets',
            include: {
              model: User,
              attributes: ['id', 'firstName', 'lastName', 'email'],
              as: 'user',
            },
          },
        ],
      },
    ],
    order: [['validityPeriod.startDate', 'desc']], // Ordering! Now [0] is the newest.
  })

  if (!courseUnits?.length > 0) {
    return null
  }

  const feedbackTargets = courseUnits.flatMap(cu => cu.feedbackTargets)
  const cuOrgIds = courseUnits.flatMap(cu => cu.courseUnitsOrganisations.map(cuo => cuo.organisationId))
  const curOrgIds = courseUnits.flatMap(cu =>
    cu.feedbackTargets.flatMap(
      fbt => fbt.courseRealisation.courseRealisationsOrganisations?.map(curo => curo.organisationId) ?? []
    )
  )
  const allOrgIds = cuOrgIds.concat(curOrgIds)

  const hasOrgAccess = Object.values(orgAccess).some(o => allOrgIds.includes(o.id))
  if (!user.isAdmin && !hasOrgAccess) {
    const hasCurAccess = feedbackTargets.some(fbt => accessibleCurIds.includes(fbt.courseRealisation.id))
    if (!hasCurAccess) {
      return ApplicationError.Forbidden('No access')
    }
  }

  const courseUnitGroup = {
    courseCode: courseUnits[0].courseCode,
    name: courseUnits[0].name,
    summary: sumSummaries(courseUnits.flatMap(cu => cu.groupSummaries)),
    feedbackTargets: _.orderBy(feedbackTargets, fbt => fbt.courseRealisation.startDate, 'desc'),
  }

  return courseUnitGroup
}

module.exports = {
  getCourseUnitGroupSummaries,
}
