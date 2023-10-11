const _ = require('lodash')
const { Op } = require('sequelize')
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
const { getSummaryAccessibleOrganisationIds } = require('./access')
const { SUMMARY_EXCLUDED_ORG_IDS, SUMMARY_SKIP_ORG_IDS } = require('../../util/config')

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
    delete cu.dataValues.summaries
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
    return null
  }

  // The organisation may have multiple summaries if the time range is larger.
  // Merge them together.
  rootOrganisation.summary = sumSummaries(rootOrganisation.summaries)
  delete rootOrganisation.dataValues.summaries

  const organisation = rootOrganisation.toJSON()

  return organisation
}

const getChildOrganisations = async ({ organisationId, startDate, endDate, organisationIds, universityWideAccess }) => {
  const rootOrganisation = await Organisation.findByPk(organisationId, {
    attributes: ['name', 'id', 'code'],
    include: [
      {
        model: Summary.scope('defaultScope', { method: ['between', startDate, endDate] }),
        as: 'summaries',
        required: false,
      },
      {
        model: Organisation,
        as: 'childOrganisations',
        attributes: ['name', 'id', 'code'],
        include: {
          model: Summary.scope('defaultScope', { method: ['between', startDate, endDate] }),
          as: 'summaries',
          required: false,
        },
        where: {
          id: {
            // If user has university wide access, we don't need to filter by organisationIds
            ...(universityWideAccess ? {} : { [Op.in]: organisationIds }),
            [Op.notIn]: SUMMARY_EXCLUDED_ORG_IDS,
          },
        },
        required: false,
      },
    ],
  })

  return rootOrganisation
}

const getOrganisationSummaryWithChildOrganisations = async ({ organisationId, startDate, endDate, user }) => {
  const organisationIds = await getSummaryAccessibleOrganisationIds(user)

  // Todo configurable specialgroups
  const universityWideAccess =
    user.isAdmin || user.specialGroup?.allProgrammes || user.specialGroup?.hyOne || user.specialGroup?.admin

  if (!universityWideAccess && !organisationIds.includes(organisationId)) {
    return ApplicationError.Forbidden(`User does not have access to organisation with id ${organisationId}`)
  }

  // Get the main organisation and its children
  const rootOrganisation = await getChildOrganisations({
    organisationId,
    startDate,
    endDate,
    organisationIds,
    universityWideAccess,
  })

  // Not found? Stop here.
  if (!rootOrganisation) {
    return null
  }

  let childOrganisations = rootOrganisation.childOrganisations.map(org => org.toJSON())

  // Skip some (configured) child organisations and get their children instead. Add them to the root organisations children.
  for (const organisationToSkip of childOrganisations.filter(org => SUMMARY_SKIP_ORG_IDS.includes(org.id))) {
    const { childOrganisations: newChildOrganisations } = await getChildOrganisations({
      organisationId: organisationToSkip.id,
      startDate,
      endDate,
      organisationIds,
      universityWideAccess,
    })

    for (const org of newChildOrganisations) {
      childOrganisations.push(org)
    }

    childOrganisations = childOrganisations.filter(org => org.id !== organisationToSkip.id)
  }

  // Each organisation may have multiple summaries if the time range is larger.
  // Merge them together.
  rootOrganisation.summary = sumSummaries(rootOrganisation.summaries)
  delete rootOrganisation.dataValues.summaries
  for (const org of childOrganisations) {
    org.summary = sumSummaries(org.summaries)
    delete org.summaries
  }

  const organisation = rootOrganisation.toJSON()
  organisation.childOrganisations = childOrganisations

  return organisation
}

const getOrganisationSummaryWithCourseUnits = async ({ organisationId, startDate, endDate }) => {
  const [organisation, courseUnits, courseRealisations] = await Promise.all([
    getOrganisationSummary({ organisationId, startDate, endDate }),
    getCourseUnitSummaries({ organisationId, startDate, endDate }),
    getCourseRealisationSummaries({ organisationId, startDate, endDate }),
  ])

  if (!organisation) {
    return null
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
