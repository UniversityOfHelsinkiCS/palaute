const { Op } = require('sequelize')
const _ = require('lodash')

const { CourseUnit, Survey, Organisation } = require('../models')

const {
  getOrganisationSummaries,
  getCourseRealisationSummaries,
} = require('../util/courseSummary')

const { ApplicationError } = require('../util/customErrors')

const WORKLOAD_QUESTION_ID = 1042

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
    attributes: ['id', 'disabledCourseCodes'],
  })

  const courseUnits = organisations.flatMap(({ courseUnits }) => courseUnits)

  const disabledCourseCodes = organisations.flatMap(
    ({ disabledCourseCodes }) => disabledCourseCodes,
  )

  const courseCodes = courseUnits.flatMap(({ courseCode }) =>
    disabledCourseCodes.includes(courseCode) ? [] : [courseCode],
  )

  return _.uniq(courseCodes)
}

const getSummaryQuestions = async () => {
  const universitySurvey = await Survey.findOne({
    where: { type: 'university' },
  })

  await universitySurvey.populateQuestions()

  const { questions = [] } = universitySurvey

  const summaryQuestions = questions.filter(
    (q) => q.type === 'LIKERT' || q.id === WORKLOAD_QUESTION_ID,
  )

  return summaryQuestions.map((question) => ({
    ...question.toJSON(),
    secondaryType: question.id === WORKLOAD_QUESTION_ID ? 'WORKLOAD' : null,
  }))
}

const getByOrganisations = async (req, res) => {
  const { user } = req

  const organisationAccess = await user.getOrganisationAccess()

  if (organisationAccess.length === 0) {
    throw new ApplicationError('Forbidden', 403)
  }

  const questions = await getSummaryQuestions()

  const organisations = await getOrganisationSummaries({
    questions,
    organisationAccess,
  })

  res.send({
    questions,
    organisations,
  })
}

const getByCourseUnit = async (req, res) => {
  const { user } = req

  const organisationAccess = await user.getOrganisationAccess()

  const organisationIds = organisationAccess.map(
    ({ organisation }) => organisation.id,
  )

  if (organisationIds.length === 0) {
    throw new ApplicationError('Forbidden', 403)
  }

  const { code } = req.params

  const [questions, courseCodes, courseUnit] = await Promise.all([
    getSummaryQuestions(),
    getAccessibleCourseCodes(organisationAccess),
    CourseUnit.findOne({ where: { courseCode: code } }),
  ])

  if (!courseUnit) {
    throw new ApplicationError('Course unit is not found', 404)
  }

  const courseRealisations = await getCourseRealisationSummaries({
    courseCode: code,
    questions,
  })

  const hasCourseUnitAccess = courseCodes.includes(
    courseRealisations[0]?.courseCode,
  )

  if (!hasCourseUnitAccess) {
    throw new ApplicationError(403, 'Forbidden')
  }

  res.send({
    questions,
    courseRealisations,
    courseUnit,
  })
}

module.exports = {
  getByOrganisations,
  getByCourseUnit,
}
