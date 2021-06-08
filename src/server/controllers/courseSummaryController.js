const { Op } = require('sequelize')
const _ = require('lodash')

const { CourseUnit, Survey, Organisation } = require('../models')

const {
  getOrganisationSummaries,
  getCourseRealisationSummaries,
} = require('../util/courseSummary')

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

const getSummaryQuestions = async () => {
  const universitySurvey = await Survey.findOne({
    where: { type: 'university' },
  })

  await universitySurvey.populateQuestions()

  const { questions = [] } = universitySurvey

  const summaryQuestions = questions.filter((q) => q.type === 'LIKERT')

  return summaryQuestions
}

const getByOrganisations = async (req, res) => {
  const { user } = req

  const organisationAccess = await user.getOrganisationAccess()

  const organisationIds = organisationAccess.map(
    ({ organisation }) => organisation.id,
  )

  if (organisationIds.length === 0) {
    throw new ApplicationError('Forbidden', 403)
  }

  const [summaryQuestions, courseCodes] = await Promise.all([
    getSummaryQuestions(),
    getAccessibleCourseCodes(organisationAccess),
  ])

  const questionIds = summaryQuestions.map(({ id }) => id)

  const organisations = await getOrganisationSummaries({
    questionIds,
    courseCodes,
    organisationAccess,
  })

  res.send({
    questions: summaryQuestions,
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

  const { courseUnitId } = req.params

  const [summaryQuestions, courseCodes, courseUnit] = await Promise.all([
    getSummaryQuestions(),
    getAccessibleCourseCodes(organisationAccess),
    CourseUnit.findByPk(courseUnitId),
  ])

  if (!courseUnit) {
    throw new ApplicationError('Course unit is not found', 404)
  }

  const questionIds = summaryQuestions.map(({ id }) => id)

  const courseRealisations = await getCourseRealisationSummaries({
    courseUnitId,
    questionIds,
  })

  const hasCourseUnitAccess = courseCodes.includes(
    courseRealisations[0]?.courseCode,
  )

  if (!hasCourseUnitAccess) {
    throw new ApplicationError(403, 'Forbidden')
  }

  res.send({
    questions: summaryQuestions,
    courseRealisations,
    courseUnit,
  })
}

module.exports = {
  getByOrganisations,
  getByCourseUnit,
}
