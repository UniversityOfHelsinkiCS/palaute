const dateFns = require('date-fns')
const { Op } = require('sequelize')
const _ = require('lodash')

const {
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  Survey,
  UserFeedbackTarget,
  Feedback,
} = require('../models')

const { ApplicationError } = require('../util/customErrors')

const getDateOrDefault = (maybeDate, fallback = new Date()) => {
  if (!maybeDate) {
    return fallback
  }

  return dateFns.isValid(new Date(maybeDate)) ? new Date(maybeDate) : fallback
}

const getAccessibleCourseUnitIds = async (user) => {
  // TODO: get actual accessible ids
  const userId = 'hy-hlo-1441871'

  const userFeedbackTargets = await UserFeedbackTarget.findAll({
    where: {
      userId,
      accessStatus: 'TEACHER',
    },
    include: [
      {
        model: FeedbackTarget,
        as: 'feedbackTarget',
        include: [
          {
            model: CourseUnit,
            as: 'courseUnit',
          },
        ],
      },
    ],
  })

  return userFeedbackTargets
    .map((target) => target.feedbackTarget?.courseUnit?.id)
    .filter(Boolean)
}

const getSummaryQuestions = async () => {
  const universitySurvey = await Survey.findOne({
    where: { type: 'university' },
  })

  await universitySurvey.populateQuestions()

  const { questions = [] } = universitySurvey

  const summaryQuestions = questions.filter((q) => q.type === 'LIKERT')

  return summaryQuestions
}

const getResults = (feedbackTargets, questions) => {
  const questionIds = questions.map((q) => q.id)

  const userFeedbackTargets = _.flatMap(
    feedbackTargets,
    (target) => target.userFeedbackTargets ?? [],
  )

  const feedbacks = userFeedbackTargets
    .map(({ feedback }) => feedback)
    .filter(Boolean)

  const feedbackData = _.flatMap(feedbacks, ({ data }) => data ?? [])

  const feedbackDataByQuestionId = _.groupBy(
    feedbackData,
    ({ questionId }) => questionId ?? '_',
  )

  const results = questionIds.map((questionId) => {
    const questionFeedbackData = feedbackDataByQuestionId[questionId] ?? []

    const feedbackValues = questionFeedbackData
      .map(({ data }) => parseInt(data, 10))
      .filter((value) => !Number.isNaN(value) && value !== 0)

    const mean =
      feedbackValues.length > 0 ? _.round(_.mean(feedbackValues), 2) : null

    return {
      questionId,
      mean,
    }
  })

  return results
}

const getCourseUnitsWithResults = (feedbackTargets, questions) => {
  const courseUnitById = new Map()

  feedbackTargets.forEach((target) => {
    courseUnitById.set(target.courseUnitId, target.courseUnit)
  })

  const feedbackTargetsByCourseUnitId = _.groupBy(
    feedbackTargets,
    ({ courseUnitId }) => courseUnitId ?? '_',
  )

  const courseUnits = Object.entries(feedbackTargetsByCourseUnitId)
    .map(([courseUnitId, targets]) => {
      const courseUnit = courseUnitById.get(courseUnitId)

      return courseUnit
        ? {
            ...courseUnit.toJSON(),
            results: getResults(targets, questions),
          }
        : null
    })
    .filter(Boolean)

  return courseUnits
}

const getCourseRealisationsWithResults = (feedbackTargets, questions) => {
  const courseRealisationById = new Map()

  feedbackTargets.forEach((target) => {
    courseRealisationById.set(
      target.courseRealisationId,
      target.courseRealisation,
    )
  })

  const feedbackTargetsByCourseRealisationId = _.groupBy(
    feedbackTargets,
    ({ courseRealisationId }) => courseRealisationId ?? '_',
  )

  const courseRealisations = Object.entries(
    feedbackTargetsByCourseRealisationId,
  )
    .map(([courseRealisationId, targets]) => {
      const courseRealisation = courseRealisationById.get(courseRealisationId)

      return courseRealisation
        ? {
            ...courseRealisation.toJSON(),
            results: getResults(targets, questions),
          }
        : null
    })
    .filter(Boolean)

  return courseRealisations
}

const getSummaryOptions = (query) => {
  const { from, to } = query

  const defaultFrom = dateFns.subYears(new Date(), 1)
  const defaultTo = new Date()

  return {
    from: getDateOrDefault(from, defaultFrom),
    to: getDateOrDefault(to, defaultTo),
  }
}

const getCourseUnitSummaries = async (req, res) => {
  const { isAdmin, user } = req

  // TODO: access control stuff
  if (!isAdmin) {
    throw new ApplicationError('Forbidden', 403)
  }

  const accessibleCourseUnitIds = await getAccessibleCourseUnitIds(user)

  if (_.isEmpty(accessibleCourseUnitIds)) {
    throw new ApplicationError('Forbidden', 403)
  }

  const { from, to } = getSummaryOptions(req.query)
  const summaryQuestions = await getSummaryQuestions()

  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      feedbackType: 'courseRealisation',
    },
    include: [
      {
        model: CourseUnit,
        as: 'courseUnit',
        required: true,
        where: {
          id: {
            [Op.in]: accessibleCourseUnitIds,
          },
        },
      },
      {
        model: CourseRealisation,
        as: 'courseRealisation',
        required: true,
        where: {
          [Op.and]: [
            {
              startDate: {
                [Op.gte]: from,
              },
            },
            {
              startDate: {
                [Op.lte]: to,
              },
            },
          ],
        },
      },
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: false,
        where: {
          accessStatus: 'STUDENT',
        },
        include: [
          {
            model: Feedback,
            as: 'feedback',
            required: false,
          },
        ],
      },
    ],
  })

  const courseUnits = getCourseUnitsWithResults(
    feedbackTargets,
    summaryQuestions,
  )

  res.send({
    questions: summaryQuestions,
    courseUnits,
  })
}

const getCourseRealisationSummaries = async (req, res) => {
  const { isAdmin } = req

  // TODO: access control stuff
  if (!isAdmin) {
    throw new ApplicationError('Forbidden', 403)
  }

  const { courseUnitId } = req.params
  const summaryQuestions = await getSummaryQuestions()

  const feedbackTargets = await FeedbackTarget.findAll({
    where: {
      feedbackType: 'courseRealisation',
      courseUnitId,
    },
    include: [
      {
        model: CourseRealisation,
        as: 'courseRealisation',
      },
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: false,
        where: {
          accessStatus: 'STUDENT',
        },
        include: [
          {
            model: Feedback,
            as: 'feedback',
            required: false,
          },
        ],
      },
    ],
  })

  const courseRealisations = getCourseRealisationsWithResults(
    feedbackTargets,
    summaryQuestions,
  )

  const sortedCourseRealisations = _.orderBy(
    courseRealisations,
    ['startDate'],
    ['desc'],
  )

  res.send({
    questions: summaryQuestions,
    courseRealisations: sortedCourseRealisations,
  })
}

module.exports = {
  getCourseUnitSummaries,
  getCourseRealisationSummaries,
}
