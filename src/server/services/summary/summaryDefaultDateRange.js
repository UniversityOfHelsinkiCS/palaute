const { addYears } = require('date-fns')
const { Op, literal } = require('sequelize')
const { startOfStudyYear } = require('../../../config/common')
const {
  FeedbackTarget,
  UserFeedbackTarget,
  CourseRealisation,
  Organisation,
} = require('../../models')

const getYearRange = (date) => {
  const startDate = startOfStudyYear(date)
  return {
    startDate,
    endDate: addYears(startDate, 1),
  }
}

const getLatestDateForOrganisations = async (organisationIds) => {
  const latestFeedbackTargetWithFeedbacks = await FeedbackTarget.findOne({
    attributes: ['id'],
    where: {
      feedbackCount: { [Op.gt]: 0 },
    },
    include: [
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
        attributes: ['startDate'],
        include: {
          model: Organisation,
          as: 'organisations',
          required: true,
          attributes: ['id'],
          where: {
            id: { [Op.in]: organisationIds },
          },
        },
      },
    ],
    order: literal('"courseRealisation.startDate" DESC'),
    limit: 1,
  })

  return latestFeedbackTargetWithFeedbacks?.courseRealisation?.startDate
}

const getLatestDateForTeacher = async (user) => {
  const latestFeedbackTargetWithFeedbacks = await UserFeedbackTarget.findOne({
    attributes: ['id'],
    where: {
      userId: user.id,
      accessStatus: 'TEACHER',
    },
    include: {
      model: FeedbackTarget,
      as: 'feedbackTarget',
      required: true,
      attributes: ['id'],
      where: {
        feedbackCount: { [Op.gt]: 0 },
      },
      include: {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
        attributes: ['startDate'],
      },
    },
    order: [
      [
        { model: FeedbackTarget, as: 'feedbackTarget' },
        { model: CourseRealisation, as: 'courseRealisation' },
        'startDate',
        'DESC',
      ],
    ],
    limit: 1,
  })

  return latestFeedbackTargetWithFeedbacks?.feedbackTarget?.courseRealisation
    ?.startDate
}

/**
 * Determines the latest year where a user/teacher has feedback stats.
 * If user has any organisation access, it is always the current (school) year.
 * If user is just a teacher with no organisation access, feedback is counted for each year
 * and the last year is determined.
 */
const getSummaryDefaultDateRange = async ({ user, organisationAccess }) => {
  if (organisationAccess.some((org) => org.access.read)) {
    const startDate = await getLatestDateForOrganisations(
      organisationAccess.map((org) => org.organisation.id),
    )
    if (!startDate) {
      return getYearRange(Date.now())
    }
    return getYearRange(startDate)
  }

  const startDate = await getLatestDateForTeacher(user)
  if (!startDate) {
    return getYearRange(Date.now())
  }
  return getYearRange(startDate)
}

module.exports = getSummaryDefaultDateRange
