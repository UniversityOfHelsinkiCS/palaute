const _ = require('lodash')
const {
  Summary,
  Organisation,
  CourseUnit,
  CourseRealisation,
  FeedbackTarget,
  CourseUnitsOrganisation,
  CourseRealisationsOrganisation,
} = require('../../models')
const { sumSummaryDatas, sumSummaries } = require('./summaryUtils')
const { ApplicationError } = require('../../util/customErrors')

const getCourseUnitSummaries = async ({ organisationId, startDate, endDate }) => {
  const courseUnits = await CourseUnit.findAll({
    attributes: ['id', 'name', 'courseCode'],
    include: [
      {
        model: CourseUnitsOrganisation,
        as: 'courseUnitsOrganisations',
        attributes: [],
        where: { organisationId },
        required: true,
      },
      {
        model: Summary.scope('defaultScope', { method: ['between', startDate, endDate] }),
        as: 'summaries',
        required: true,
      },
    ],
  })

  for (const cu of courseUnits) {
    cu.summary = sumSummaries(cu.summaries)
  }

  return courseUnits
}

const getCourseRealisationSummaries = async ({ organisationId, startDate, endDate }) => {
  const courseRealisations = await CourseRealisation.findAll({
    attributes: ['id'],
    include: [
      {
        model: CourseRealisationsOrganisation,
        as: 'courseRealisationsOrganisations',
        attributes: [],
        where: { organisationId },
        required: true,
      },
      {
        model: Summary.scope('defaultScope', { method: ['between', startDate, endDate] }),
        as: 'summary',
        required: true,
      },
      {
        model: FeedbackTarget,
        as: 'feedbackTargets',
        attributes: ['id'],
        required: true,
        include: {
          model: CourseUnit,
          as: 'courseUnit',
          attributes: ['name', 'id', 'courseCode'],
          required: true,
        },
      },
    ],
  })

  return courseRealisations
}

const getOrganisationSummary = async ({ organisationId, startDate, endDate }) => {
  const rootOrganisation = await Organisation.findByPk(organisationId, {
    attributes: ['name', 'id', 'code'],
    include: {
      model: Summary.scope('defaultScope', { method: ['between', startDate, endDate] }),
      as: 'summaries',
      required: true,
    },
  })

  if (!rootOrganisation) {
    return ApplicationError.NotFound(`Summary for organisation with id ${organisationId} not found`)
  }

  // The organisation may have multiple summaries if the time range is larger.
  // Merge them together.
  rootOrganisation.summary = sumSummaries(rootOrganisation.summaries)

  const organisation = rootOrganisation.toJSON()

  return organisation
}

const getOrganisationSummaryWithChildOrganisations = async ({ organisationId, startDate, endDate }) => {
  const rootOrganisation = await Organisation.findByPk(organisationId, {
    attributes: ['name', 'id', 'code'],
    include: [
      {
        model: Summary.scope('defaultScope', { method: ['between', startDate, endDate] }),
        as: 'summaries',
        required: true,
      },
      {
        model: Organisation,
        as: 'childOrganisations',
        attributes: ['name', 'id', 'code'],
        include: {
          model: Summary.scope('defaultScope', { method: ['between', startDate, endDate] }),
          as: 'summaries',
          required: true,
        },
      },
    ],
  })

  if (!rootOrganisation) {
    return ApplicationError.NotFound(`Summary for organisation with id ${organisationId} not found`)
  }

  // Each organisation may have multiple summaries if the time range is larger.
  // Merge them together.
  rootOrganisation.summary = sumSummaries(rootOrganisation.summaries)
  for (const org of rootOrganisation.childOrganisations) {
    org.summary = sumSummaries(org.summaries)
  }

  const organisation = rootOrganisation.toJSON()

  return organisation
}

const getOrganisationSummaryWithCourseUnits = async ({ organisationId, startDate, endDate }) => {
  const [organisation, courseUnits, courseRealisations] = await Promise.all([
    getOrganisationSummary({ organisationId, startDate, endDate }),
    getCourseUnitSummaries({ organisationId, startDate, endDate }),
    getCourseRealisationSummaries({ organisationId, startDate, endDate }),
  ])

  if (!organisation) {
    return ApplicationError.NotFound(`Summary for organisation with id ${organisationId} not found`)
  }

  // Root organisation may have multiple summaries if the time range is larger.
  // Merge them together.
  organisation.summary = sumSummaries(organisation.summaries)
  for (const cu of courseUnits) {
    cu.summary = sumSummaries(cu.summaries)
  }

  // Mangeling to do: we dont want to show individual CURs under organisation.
  // Instead, construct partial CUs from them.
  const partialCourseRealisations = courseRealisations.filter(
    cur => !courseUnits.some(cu => cu.id === cur.feedbackTargets[0].courseUnit.id)
  )

  // Group course realisations by associated course unit
  const groupedPartialCourseUnits = _.groupBy(partialCourseRealisations, cur => cur.feedbackTargets[0].courseUnit.id)
  // Now aggregate course units
  const partialCourseUnits = Object.entries(groupedPartialCourseUnits).map(([courseUnitId, courseRealisations]) => {
    const summaryData = sumSummaryDatas(courseRealisations.map(cur => cur.summary.data))
    const { courseUnit } = groupedPartialCourseUnits[courseUnitId][0].feedbackTargets[0]

    return {
      id: courseUnitId,
      name: courseUnit.name,
      courseCode: courseUnit.courseCode,
      summary: {
        data: summaryData,
      },
      partial: true,
    }
  })

  organisation.courseUnits = courseUnits.concat(partialCourseUnits)

  return organisation
}

module.exports = {
  getOrganisationSummary,
  getOrganisationSummaryWithChildOrganisations,
  getOrganisationSummaryWithCourseUnits,
}
