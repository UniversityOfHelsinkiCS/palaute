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

const MATLU_CODE_PREFIXES = [
  'TKT',
  'MAT',
  'FYS',
  'DATA',
  'BSC',
].flatMap((code) => [code, `AY${code}`])

const parseProgrammeCode = (courseCode) => {
  if (!courseCode) {
    return null
  }

  const [, programmePart] = courseCode.match(/^([a-z]+)[0-9]+/i)

  return programmePart ? programmePart.replace(/^AY/, '') : null
}

const getDateOrDefault = (maybeDate, fallback = new Date()) => {
  if (!maybeDate) {
    return fallback
  }

  return dateFns.isValid(new Date(maybeDate)) ? new Date(maybeDate) : fallback
}

const getAccessibleCourseUnitIds = async () => {
  // TODO: get actual accessible ids
  const courseCodeRegexp = `^(${MATLU_CODE_PREFIXES.join('|')})`

  const courseUnits = await CourseUnit.findAll({
    where: {
      courseCode: {
        [Op.iRegexp]: courseCodeRegexp,
      },
    },
  })

  return courseUnits.map((c) => c.id)
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

const getProgrammesWithResults = (feedbackTargets, questions) => {
  const feedbackTargetsByProgrammeCode = _.groupBy(
    feedbackTargets,
    ({ courseUnit }) => parseProgrammeCode(courseUnit?.courseCode),
  )

  const programmes = Object.entries(feedbackTargetsByProgrammeCode).map(
    ([programmeCode, targets]) => {
      const { results, feedbackCount } = getResults(targets, questions)

      const courseUnits = _.orderBy(
        getCourseUnitsWithResults(targets, questions),
        ['courseCode'],
      )

      return {
        programmeCode,
        results,
        feedbackCount,
        courseUnits,
      }
    },
  )

  return _.orderBy(programmes, ['programmeCode'])
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
  const { isAdmin, user } = req

  if (!isAdmin) {
    throw new ApplicationError('Forbidden', 403)
  }

  // TODO: user for access control
  const organisationAccess = await user.getOrganisationAccess()

  const accessibleCourseUnitIds = await getAccessibleCourseUnitIds(user)

  if (accessibleCourseUnitIds.length === 0) {
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

  const programmes = getProgrammesWithResults(feedbackTargets, summaryQuestions)

  res.send({
    questions: summaryQuestions,
    programmes,
  })
}

const getCourseRealisationSummaries = async (req, res) => {
  const { isAdmin, user } = req

  if (!isAdmin) {
    throw new ApplicationError('Forbidden', 403)
  }

  const organisationAccess = await user.getOrganisationAccess()

  const organisationIds = organisationAccess.map(
    ({ organisation }) => organisation.id,
  )

  if (organisationIds.length === 0) {
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

  const courseUnitOrganisationIds = (
    feedbackTargets[0]?.courseUnit?.organisations ?? []
  ).map(({ id }) => id)

  // TODO: use this for access control
  const hasCourseUnitAccess = courseUnitOrganisationIds.some((id) =>
    organisationIds.includes(id),
  )

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
