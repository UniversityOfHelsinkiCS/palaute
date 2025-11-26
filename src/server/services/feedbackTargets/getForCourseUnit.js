const _ = require('lodash')
const { Op } = require('sequelize')
const { FeedbackTarget, CourseRealisation, UserFeedbackTarget, CourseUnit } = require('../../models')
const { getFeedbackTargetSurveys } = require('../surveys/getFeedbackTargetSurveys')

const getForCourseUnit = async ({
  courseCode,
  user,
  startDateAfter,
  startDateBefore,
  endDateAfter,
  endDateBefore,
  feedbackType,
  includeSurveys,
  isOrganisationSurvey,
}) => {
  const courseRealisationWhere = {
    [Op.and]: [
      startDateAfter && {
        startDate: {
          [Op.gt]: new Date(startDateAfter),
        },
      },
      startDateBefore && {
        startDate: {
          [Op.lt]: new Date(startDateBefore),
        },
      },
      endDateAfter && {
        endDate: {
          [Op.gt]: new Date(endDateAfter),
        },
      },
      endDateBefore && {
        endDate: {
          [Op.lt]: new Date(endDateBefore),
        },
      },
    ].filter(Boolean),
  }

  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      [Op.and]: [
        feedbackType && {
          feedbackType,
        },
      ].filter(Boolean),
    },
    order: [[{ model: CourseRealisation, as: 'courseRealisation' }, 'startDate', 'DESC']],
    include: [
      {
        model: UserFeedbackTarget.scope('teachers'),
        as: 'userFeedbackTargets',
        required: true,
        where: isOrganisationSurvey ? { userCreated: true } : { userId: user.id },
      },
      {
        model: UserFeedbackTarget.scope('students'),
        as: 'students',
        required: false,
      },
      {
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
        where: {
          courseCode,
        },
      },
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
        where: courseRealisationWhere,
      },
    ],
  })

  if (feedbackTargets.length === 0) {
    return []
  }

  if (includeSurveys === 'true') {
    for (const target of feedbackTargets) {
      const surveys = await getFeedbackTargetSurveys(target)
      target.populateSurveys(surveys)
    }
  }

  const formattedFeedbackTargets = feedbackTargets.map(target => ({
    ..._.pick(target.toJSON(), [
      'id',
      'name',
      'opensAt',
      'closesAt',
      'feedbackType',
      'courseRealisation',
      'courseUnit',
      'feedbackResponse',
      'continuousFeedbackEnabled',
      'questions',
      'surveys',
      'userCreated',
    ]),
    studentCount: target.students.length,
    feedbackResponseGiven: target.feedbackResponse?.length > 3,
    feedbackResponseSent: target.feedbackResponseEmailSent,
  }))

  return formattedFeedbackTargets
}

module.exports = {
  getForCourseUnit,
}
