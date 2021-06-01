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
  Organisation,
} = require('../models')

const { ApplicationError } = require('../util/customErrors')

const getAccessibleCourseCodes = async (organisationAccess) => {
  const organisationIds = organisationAccess.map(
    ({ organisation }) => organisation.id,
  )

  const organisations = await Organisation.findAll({
    where: {
      id: {
        [Op.in]: organisationIds,
      },
    },
    include: [
      {
        model: CourseUnit,
        as: 'courseUnits',
        attributes: ['courseCode'],
        required: true,
      },
    ],
    attributes: ['id'],
  })

  const courseUnits = organisations.flatMap(({ courseUnits }) => courseUnits)

  const courseCodes = courseUnits.flatMap(({ courseCode }) => [
    courseCode,
    `AY${courseCode}`, // hack for open university courses
  ])

  return _.uniq(courseCodes)
}

const getDateOrDefault = (maybeDate, fallback = new Date()) => {
  if (!maybeDate) {
    return fallback
  }

  return dateFns.isValid(new Date(maybeDate)) ? new Date(maybeDate) : fallback
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

  const userFeedbackTargets = feedbackTargets.flatMap(
    (target) => target.userFeedbackTargets ?? [],
  )

  const feedbacks = userFeedbackTargets
    .map(({ feedback }) => feedback)
    .filter(Boolean)

  const feedbackData = feedbacks.flatMap(({ data }) => data ?? [])

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

  return {
    results,
    feedbackCount: feedbacks.length,
  }
}

const getCourseUnitsWithResults = (feedbackTargets, questions) => {
  const courseUnitById = new Map()

  feedbackTargets.forEach((target) => {
    courseUnitById.set(target.courseUnitId, target.courseUnit)
  })

  const feedbackTargetsByCourseUnitId = _.groupBy(
    feedbackTargets,
    ({ courseUnitId }) => courseUnitId,
  )

  const courseUnits = Object.entries(feedbackTargetsByCourseUnitId).map(
    ([courseUnitId, targets]) => {
      const courseUnit = courseUnitById.get(courseUnitId).toJSON()

      const latestTarget = _.maxBy(
        targets,
        ({ courseRealisation }) => courseRealisation?.startDate ?? new Date(0),
      )

      const { results, feedbackCount } = getResults(targets, questions)

      return {
        ...courseUnit,
        results,
        feedbackCount,
        feedbackResponse: latestTarget?.feedbackResponse ?? null,
      }
    },
  )

  return courseUnits
}

const getCourseRealisationsWithResults = (feedbackTargets, questions) => {
  const courseRealisationById = new Map()
  const feedbackTargetByCourseRealisationId = new Map()

  feedbackTargets.forEach((target) => {
    const { courseRealisationId, courseRealisation } = target

    courseRealisationById.set(courseRealisationId, courseRealisation)

    feedbackTargetByCourseRealisationId.set(courseRealisationId, target)
  })

  const feedbackTargetsByCourseRealisationId = _.groupBy(
    feedbackTargets,
    ({ courseRealisationId }) => courseRealisationId,
  )

  const courseRealisations = Object.entries(
    feedbackTargetsByCourseRealisationId,
  ).map(([courseRealisationId, targets]) => {
    const courseRealisation = courseRealisationById
      .get(courseRealisationId)
      .toJSON()

    const feedbackTarget = _.pick(
      feedbackTargetByCourseRealisationId.get(courseRealisationId).toJSON(),
      ['id', 'name', 'closesAt', 'opensAt', 'feedbackResponse'],
    )

    const { results, feedbackCount } = getResults(targets, questions)

    return {
      ...courseRealisation,
      feedbackTarget,
      results,
      feedbackCount,
    }
  })

  return courseRealisations
}

const getOrganisationsWithResults = (feedbackTargets, questions) => {
  const organisationById = new Map()
  const feedbackTargetsByOrganisationId = new Map()

  feedbackTargets.forEach((target) => {
    const { courseUnit } = target
    const { organisations } = courseUnit

    organisations.forEach((organisation) => {
      const targets = feedbackTargetsByOrganisationId.get(organisation.id) ?? []

      organisationById.set(organisation.id, organisation)

      feedbackTargetsByOrganisationId.set(organisation.id, [...targets, target])
    })
  })

  const organisations = Array.from(
    feedbackTargetsByOrganisationId.entries(),
  ).map(([organisationId, targets]) => {
    const { results, feedbackCount } = getResults(targets, questions)

    const courseUnits = _.orderBy(
      getCourseUnitsWithResults(targets, questions),
      ['courseCode'],
    )

    const organisation = _.pick(organisationById.get(organisationId).toJSON(), [
      'name',
      'id',
      'code',
    ])

    return {
      ...organisation,
      results,
      feedbackCount,
      courseUnits,
    }
  })

  return _.orderBy(organisations, ['code'])
}

const getSummaryOptions = (query) => {
  const { from, to } = query

  const defaultFrom = dateFns.startOfYear(new Date())
  const defaultTo = dateFns.endOfYear(new Date())

  return {
    from: getDateOrDefault(from, defaultFrom),
    to: getDateOrDefault(to, defaultTo),
  }
}

const getCourseUnitSummaries = async (req, res) => {
  const { user } = req

  const organisationAccess = await user.getOrganisationAccess()

  const organisationIds = organisationAccess.map(
    ({ organisation }) => organisation.id,
  )

  if (organisationIds.length === 0) {
    throw new ApplicationError('Forbidden', 403)
  }

  const { from, to } = getSummaryOptions(req.query)

  const [summaryQuestions, courseCodes] = await Promise.all([
    getSummaryQuestions(),
    getAccessibleCourseCodes(organisationAccess),
  ])

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
          courseCode: {
            [Op.in]: courseCodes,
          },
        },
        include: [
          {
            model: Organisation,
            as: 'organisations',
            required: true,
          },
        ],
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
        required: true,
        where: {
          accessStatus: 'STUDENT',
        },
        include: [
          {
            model: Feedback,
            as: 'feedback',
            required: true,
          },
        ],
      },
    ],
  })

  const organisations = getOrganisationsWithResults(
    feedbackTargets,
    summaryQuestions,
  )

  res.send({
    questions: summaryQuestions,
    organisations,
  })
}

const getCourseRealisationSummaries = async (req, res) => {
  const { user } = req

  const organisationAccess = await user.getOrganisationAccess()

  const organisationIds = organisationAccess.map(
    ({ organisation }) => organisation.id,
  )

  if (organisationIds.length === 0) {
    throw new ApplicationError('Forbidden', 403)
  }

  const { courseUnitId } = req.params

  const [summaryQuestions, courseCodes] = await Promise.all([
    getSummaryQuestions(),
    getAccessibleCourseCodes(organisationAccess),
  ])

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
        model: CourseUnit,
        as: 'courseUnit',
        include: [{ model: Organisation, as: 'organisations' }],
      },
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: true,
        where: {
          accessStatus: 'STUDENT',
        },
        include: [
          {
            model: Feedback,
            as: 'feedback',
            required: true,
          },
        ],
      },
    ],
  })

  const hasCourseUnitAccess = courseCodes.includes(
    feedbackTargets[0]?.courseUnit?.courseCode,
  )

  if (!hasCourseUnitAccess) {
    throw new ApplicationError(403, 'Forbidden')
  }

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
