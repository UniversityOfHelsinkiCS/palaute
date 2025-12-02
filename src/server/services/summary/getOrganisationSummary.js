const _ = require('lodash')
const { Op } = require('sequelize')
const {
  Organisation,
  CourseUnit,
  CourseRealisation,
  FeedbackTarget,
  CourseUnitsOrganisation,
  CourseRealisationsOrganisation,
  Tag,
  CourseUnitsTag,
  CourseRealisationsTag,
} = require('../../models')
const { sumSummaryDatas, sumSummaries, getScopedSummary } = require('./utils')
const { ApplicationError } = require('../../util/customErrors')
const { getSummaryAccessibleOrganisationIds } = require('./access')
const {
  SUMMARY_EXCLUDED_ORG_IDS,
  SUMMARY_SKIP_ORG_IDS,
  UNIVERSITY_LEVEL_VIEWING_SPECIAL_GROUPS,
} = require('../../util/config')
const { prefixTagId } = require('../../util/common')

/**
 * Wrap a function that requires organisation access check.
 */
const withOrganisationAccessCheck = asyncFunction => async params => {
  const organisationIds = await getSummaryAccessibleOrganisationIds(params.user)
  const userSpecialGroups = Object.keys(params.user.specialGroup)
  const universityWideAccess = UNIVERSITY_LEVEL_VIEWING_SPECIAL_GROUPS.some(group => userSpecialGroups.includes(group))

  if (!universityWideAccess && !organisationIds.includes(params.organisationId)) {
    throw ApplicationError.Forbidden(`User does not have access to organisation with id ${params.organisationId}`)
  }

  params.accessibleOrganisationIds = organisationIds
  params.universityWideAccess = universityWideAccess

  return asyncFunction(params)
}

const getCourseUnitSummaries = async ({ organisationId, startDate, endDate, tagId, extraOrgId, extraOrgMode }) => {
  const scopedSummary = getScopedSummary({ startDate, endDate, extraOrgId, extraOrgMode })

  const courseUnits = await CourseUnit.findAll({
    attributes: ['id', 'name', 'groupId', 'courseCode'],
    include: [
      {
        model: CourseUnitsOrganisation,
        as: 'courseUnitsOrganisations',
        attributes: [],
        where: { organisationId },
        required: true,
      },
      {
        model: scopedSummary,
        as: 'groupSummaries',
        required: true,
      },
      ...(tagId
        ? [
            {
              // Include only if tagId defined in this request
              model: CourseUnitsTag,
              as: 'courseUnitsTags',
              attributes: [],
              where: { tagId },
              required: true,
            },
          ]
        : []),
    ],
    order: [['courseCode', 'ASC']],
  })

  const groupedCourseUnits = _.groupBy(courseUnits, cu => cu.groupId)
  const aggregatedCourseUnits = Object.values(groupedCourseUnits).map(courseUnits => {
    // Each of courseUnits has the same groupId and groupSummaries (calculated from the group...) so we can do this:
    const cu = courseUnits[0]

    cu.summary = sumSummaries(cu.groupSummaries)
    delete cu.dataValues.groupSummaries

    return cu.toJSON()
  })

  return aggregatedCourseUnits
}

const getCourseRealisationSummaries = async ({
  organisationId,
  startDate,
  endDate,
  tagId,
  extraOrgId,
  extraOrgMode,
}) => {
  const scopedSummary = getScopedSummary({ startDate, endDate, extraOrgId, extraOrgMode })

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
        model: scopedSummary,
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
          attributes: ['name', 'id', 'courseCode', 'groupId'],
          required: true,
        },
      },
      ...(tagId
        ? [
            {
              // Include only if tagId defined in this request
              model: CourseRealisationsTag,
              as: 'courseRealisationsTags',
              attributes: [],
              where: { tagId },
              required: true,
            },
          ]
        : []),
    ],
    // logging: true,
  })

  return courseRealisations
}

const getOrganisationSummary = async ({ organisationId, startDate, endDate, extraOrgId, extraOrgMode }) => {
  const scopedSummary = getScopedSummary({ startDate, endDate, extraOrgId, extraOrgMode })

  const rootOrganisation = await Organisation.findByPk(organisationId, {
    attributes: ['name', 'id', 'code'],
    include: {
      model: scopedSummary,
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

const getChildOrganisations = async ({
  organisationId,
  startDate,
  endDate,
  organisationIds,
  universityWideAccess,
  extraOrgId,
  extraOrgMode,
}) => {
  const scopedSummary = getScopedSummary({ startDate, endDate, extraOrgId, extraOrgMode })

  const rootOrganisation = await Organisation.findByPk(organisationId, {
    attributes: ['name', 'id', 'code'],
    include: [
      {
        model: scopedSummary,
        as: 'summaries',
        required: false,
      },
      {
        model: Organisation,
        as: 'childOrganisations',
        attributes: ['name', 'id', 'code'],
        include: {
          model: scopedSummary,
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
        order: [['code', 'ASC']],
      },
    ],
  })

  return rootOrganisation
}

const getOrganisationSummaryWithChildOrganisations = async ({
  organisationId,
  startDate,
  endDate,
  universityWideAccess,
  accessibleOrganisationIds,
  extraOrgId,
  extraOrgMode,
}) => {
  // Get the main organisation and its children
  const rootOrganisation = await getChildOrganisations({
    organisationId,
    startDate,
    endDate,
    organisationIds: accessibleOrganisationIds,
    universityWideAccess,
    extraOrgId,
    extraOrgMode,
  })

  // Not found? Stop here.
  if (!rootOrganisation) {
    return null
  }

  let { childOrganisations } = rootOrganisation

  // Skip some (configured) child organisations and get their children instead. Add them to the root organisations children.
  for (const organisationToSkip of childOrganisations.filter(org => SUMMARY_SKIP_ORG_IDS.includes(org.id))) {
    const { childOrganisations: newChildOrganisations } = await getChildOrganisations({
      organisationId: organisationToSkip.id,
      startDate,
      endDate,
      organisationIds: accessibleOrganisationIds,
      universityWideAccess,
    })

    for (const org of newChildOrganisations) {
      childOrganisations.push(org)
    }

    childOrganisations = childOrganisations.filter(org => org.id !== organisationToSkip.id)
  }

  // Each organisation may have multiple summaries if the time range is larger.
  // Merge them together.
  const summary = sumSummaries(rootOrganisation.summaries)
  rootOrganisation.summary = summary
  // console.log('root org summary', rootOrganisation.id, rootOrganisation.dataValues.summary, rootOrganisation.summaries)
  delete rootOrganisation.dataValues.summaries
  for (const org of childOrganisations) {
    org.summary = sumSummaries(org.summaries)
    // console.log('org summary', org.id, org.summary)
    delete org.summaries
  }

  const organisation = rootOrganisation.toJSON()
  organisation.childOrganisations = childOrganisations.map(org => org.toJSON())

  return organisation
}

const getOrganisationSummaryWithCourseUnits = async ({
  organisationId,
  startDate,
  endDate,
  tagId,
  extraOrgId,
  extraOrgMode,
}) => {
  const [organisation, courseUnits, courseRealisations] = await Promise.all([
    getOrganisationSummary({ organisationId, startDate, endDate, extraOrgId, extraOrgMode }),
    getCourseUnitSummaries({ organisationId, startDate, endDate, tagId, extraOrgId, extraOrgMode }),
    getCourseRealisationSummaries({ organisationId, startDate, endDate, tagId, extraOrgId, extraOrgMode }),
  ])

  if (!organisation) {
    return null
  }

  // Mangeling to do: we dont want to show individual CURs under organisation.
  // Instead, construct partial CUs from them.
  const partialCourseRealisations = courseRealisations.filter(
    cur => !courseUnits.some(cu => cu.groupId === cur.feedbackTargets[0].courseUnit.groupId)
  )

  // Group course realisations by associated course unit group id
  const groupedPartialCourseUnits = _.groupBy(
    partialCourseRealisations,
    cur => cur.feedbackTargets[0].courseUnit.groupId
  )
  // Now aggregate course units
  const partialCourseUnits = Object.entries(groupedPartialCourseUnits).map(
    ([courseUnitGroupId, courseRealisations]) => {
      const summaryData = sumSummaryDatas(courseRealisations.map(cur => cur.summary.data))
      const { courseUnit } = groupedPartialCourseUnits[courseUnitGroupId][0].feedbackTargets[0]

      return {
        id: courseUnit.id,
        name: courseUnit.name,
        courseCode: courseUnit.courseCode,
        summary: {
          data: summaryData,
        },
        partial: true,
      }
    }
  )

  organisation.courseUnits = courseUnits.concat(partialCourseUnits)

  return organisation
}

const getOrganisationSummaryWithTags = async ({ organisationId, startDate, endDate, extraOrgId, extraOrgMode }) => {
  const scopedSummary = getScopedSummary({ startDate, endDate, extraOrgId, extraOrgMode })
  const organisation = await getOrganisationSummary({ organisationId, startDate, endDate, extraOrgId, extraOrgMode })

  if (!organisation) {
    return null
  }

  const tags = await Tag.findAll({
    where: {
      organisationId,
    },
    attributes: ['id', 'name'],
  })

  const tagEntityIds = tags.map(tag => prefixTagId(tag.id))
  const summaries = await scopedSummary.findAll({
    where: {
      entityId: tagEntityIds,
    },
  })

  organisation.tags = tags.map(tag => {
    const tagSummaries = summaries.filter(s => s.entityId === prefixTagId(tag.id))
    tag.summary = sumSummaries(tagSummaries)
    return tag.toJSON()
  })

  return organisation
}

module.exports = {
  getOrganisationSummary: withOrganisationAccessCheck(getOrganisationSummary),
  getOrganisationSummaryWithChildOrganisations: withOrganisationAccessCheck(
    getOrganisationSummaryWithChildOrganisations
  ),
  getOrganisationSummaryWithCourseUnits: withOrganisationAccessCheck(getOrganisationSummaryWithCourseUnits),
  getOrganisationSummaryWithTags: withOrganisationAccessCheck(getOrganisationSummaryWithTags),
}
