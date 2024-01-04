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
  UserFeedbackTarget,
  Tag,
  CourseUnitsTag,
  CourseRealisationsTag,
} = require('../../models')
const { sumSummaryDatas, sumSummaries } = require('./summaryUtils')
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

const getCourseUnitSummaries = async ({ organisationId, startDate, endDate, tagId }) => {
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
        model: Summary.scope({ method: ['at', startDate, endDate] }),
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

const getCourseRealisationSummaries = async ({ organisationId, startDate, endDate, tagId }) => {
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
        model: Summary.scope({ method: ['at', startDate, endDate] }),
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

const getOrganisationSummary = async ({ organisationId, startDate, endDate }) => {
  const rootOrganisation = await Organisation.findByPk(organisationId, {
    attributes: ['name', 'id', 'code'],
    include: {
      model: Summary.scope({ method: ['at', startDate, endDate] }),
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
        model: Summary.scope({ method: ['at', startDate, endDate] }),
        as: 'summaries',
        required: false,
      },
      {
        model: Organisation,
        as: 'childOrganisations',
        attributes: ['name', 'id', 'code'],
        include: {
          model: Summary.scope({ method: ['at', startDate, endDate] }),
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
}) => {
  // Get the main organisation and its children
  const rootOrganisation = await getChildOrganisations({
    organisationId,
    startDate,
    endDate,
    organisationIds: accessibleOrganisationIds,
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

const getOrganisationSummaryWithCourseUnits = async ({ organisationId, startDate, endDate, tagId }) => {
  const [organisation, courseUnits, courseRealisations] = await Promise.all([
    getOrganisationSummary({ organisationId, startDate, endDate }),
    getCourseUnitSummaries({ organisationId, startDate, endDate, tagId }),
    getCourseRealisationSummaries({ organisationId, startDate, endDate, tagId }),
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

const getOrganisationSummaryWithTags = async ({ organisationId, startDate, endDate }) => {
  const organisation = await getOrganisationSummary({ organisationId, startDate, endDate })

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
  const summaries = await Summary.scope({ method: ['at', startDate, endDate] }).findAll({
    where: {
      entityId: tagEntityIds,
    },
    attributes: ['entityId', 'data'],
  })

  organisation.tags = tags.map(tag => {
    tag.summary = sumSummaries(summaries.filter(s => s.entityId === prefixTagId(tag.id)))
    return tag.toJSON()
  })

  return organisation
}

const getTeacherSummary = async ({ startDate, endDate, user }) => {
  const organisations = await Organisation.findAll({
    attributes: ['id', 'name', 'code'],
    include: [
      {
        model: Summary.scope({ method: ['at', startDate, endDate] }),
        as: 'summaries',
      },
      {
        model: CourseUnit,
        attributes: ['id', 'groupId', 'name', 'courseCode'],
        as: 'courseUnits',
        required: true,
        through: {
          attributes: [],
          where: {
            type: 'PRIMARY',
          },
        },
        include: [
          {
            model: Summary.scope({ method: ['at', startDate, endDate] }),
            as: 'groupSummaries',
            required: true,
          },
          {
            model: FeedbackTarget,
            attributes: ['id'],
            as: 'feedbackTargets',
            required: true,
            include: [
              {
                model: UserFeedbackTarget,
                as: 'userFeedbackTargets',
                attributes: ['id'],
                required: true,
                where: {
                  userId: user.id,
                  accessStatus: { [Op.in]: ['RESPONSIBLE_TEACHER', 'TEACHER'] },
                },
              },
              {
                model: CourseRealisation,
                as: 'courseRealisation',
                attributes: ['id', 'name', 'startDate', 'endDate'],
                required: true,
                include: [
                  {
                    model: Summary.scope({ method: ['at', startDate, endDate] }),
                    as: 'summary',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  })

  const organisationsJson = organisations.map(org => {
    org.summary = sumSummaries(org.summaries)
    delete org.dataValues.summaries

    const groupedCourseUnits = _.groupBy(org.courseUnits, cu => cu.groupId)
    const courseUnits = Object.values(groupedCourseUnits).map(courseUnits => {
      // Each of courseUnits has the same groupId and groupSummaries (calculated from the group...) so we can do this:
      const cu = courseUnits[0]
      cu.summary = sumSummaries(cu.groupSummaries)
      delete cu.dataValues.groupSummaries

      const courseRealisations = courseUnits.flatMap(cu =>
        cu.feedbackTargets.map(fbt => {
          const { courseRealisation: cur } = fbt
          cur.summary = sumSummaries(cur.summary)

          return cur.toJSON()
        })
      )

      delete cu.dataValues.feedbackTargets

      return {
        ...cu.toJSON(),
        courseRealisations,
      }
    })

    return {
      ...org.toJSON(),
      courseUnits: _.orderBy(courseUnits, ['courseCode'], ['asc']),
    }
  })

  return organisationsJson
}

const getUserOrganisationSummaries = async ({ startDate, endDate, user, viewingMode = 'flat' }) => {
  const organisationIds = await getSummaryAccessibleOrganisationIds(user)

  const organisations = await Organisation.findAll({
    attributes: ['id', 'name', 'code', 'parentId'],
    where: {
      id: {
        [Op.in]: organisationIds,
        [Op.notIn]: SUMMARY_EXCLUDED_ORG_IDS,
      },
    },
    include: {
      model: Summary.scope({ method: ['at', startDate, endDate] }),
      as: 'summaries',
      required: false,
    },
    order: [['code', 'ASC']],
  })

  const organisationsJson = organisations.map(org => {
    org.summary = sumSummaries(org.summaries)
    delete org.dataValues.summaries
    return org.toJSON()
  })

  if (viewingMode === 'flat') {
    return organisationsJson
  }

  if (viewingMode === 'tree') {
    const rootOrganisations = []
    for (const org of organisationsJson) {
      const parentOrg = organisationsJson.find(o => o.id === org.parentId)
      if (!parentOrg) {
        rootOrganisations.push(org)
      } else {
        if (!parentOrg.childOrganisations) {
          parentOrg.childOrganisations = []
        }
        parentOrg.childOrganisations.push(org)
        parentOrg.initiallyExpanded = true
      }
    }

    return rootOrganisations
  }

  return ApplicationError.BadRequest(`Invalid viewing mode ${viewingMode}`)
}

module.exports = {
  getOrganisationSummary: withOrganisationAccessCheck(getOrganisationSummary),
  getOrganisationSummaryWithChildOrganisations: withOrganisationAccessCheck(
    getOrganisationSummaryWithChildOrganisations
  ),
  getOrganisationSummaryWithCourseUnits: withOrganisationAccessCheck(getOrganisationSummaryWithCourseUnits),
  getOrganisationSummaryWithTags: withOrganisationAccessCheck(getOrganisationSummaryWithTags),
  getTeacherSummary,
  getUserOrganisationSummaries,
}
