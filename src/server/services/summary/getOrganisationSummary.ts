import _ from 'lodash'
import { Op } from 'sequelize'
import {
  Organisation,
  CourseUnit,
  CourseRealisation,
  FeedbackTarget,
  CourseUnitsOrganisation,
  CourseRealisationsOrganisation,
  Tag,
  CourseUnitsTag,
  CourseRealisationsTag,
} from '../../models'
import { sumSummaryDatas, sumSummaries, getScopedSummary } from './utils'
import { ApplicationError } from '../../util/customErrors'
import { getSummaryAccessibleOrganisationIds } from './access'
import {
  SUMMARY_EXCLUDED_ORG_IDS,
  SUMMARY_SKIP_ORG_IDS,
  UNIVERSITY_LEVEL_VIEWING_SPECIAL_GROUPS,
} from '../../util/config'
import { prefixTagId } from '../../util/common'

/**
 * Wrap a function that requires organisation access check.
 */
const withOrganisationAccessCheck =
  <P, R>(asyncFunction: (params: P) => Promise<R>) =>
  async (
    params: P & {
      user: any
      organisationId: string
      accessibleOrganisationIds?: string[]
      universityWideAccess?: boolean
    }
  ) => {
    const organisationIds = await getSummaryAccessibleOrganisationIds(params.user)
    const userSpecialGroups = Object.keys(params.user.specialGroup)
    const universityWideAccess = UNIVERSITY_LEVEL_VIEWING_SPECIAL_GROUPS.some(group =>
      userSpecialGroups.includes(group)
    )

    if (!universityWideAccess && !organisationIds.includes(params.organisationId)) {
      ApplicationError.Forbidden(`User does not have access to organisation with id ${params.organisationId}`)
    }

    params.accessibleOrganisationIds = organisationIds
    params.universityWideAccess = universityWideAccess

    return asyncFunction(params)
  }

interface GetCourseUnitSummariesParams {
  organisationId: string
  startDate: string
  endDate: string
  tagId?: string
  extraOrgId?: string
  extraOrgMode?: 'include' | 'exclude'
}

const getCourseUnitSummaries = async ({
  organisationId,
  startDate,
  endDate,
  tagId,
  extraOrgId,
  extraOrgMode,
}: GetCourseUnitSummariesParams) => {
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

interface GetCourseRealisationSummariesParams {
  organisationId: string
  startDate: string
  endDate: string
  tagId?: string
  extraOrgId?: string
  extraOrgMode?: 'include' | 'exclude'
}

const getCourseRealisationSummaries = async ({
  organisationId,
  startDate,
  endDate,
  tagId,
  extraOrgId,
  extraOrgMode,
}: GetCourseRealisationSummariesParams) => {
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
        include: [
          {
            model: CourseUnit,
            as: 'courseUnit',
            attributes: ['name', 'id', 'courseCode', 'groupId'],
            required: true,
          },
        ],
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

interface GetOrganisationSummaryParams {
  organisationId: string
  startDate: string
  endDate: string
  extraOrgId?: string
  extraOrgMode?: 'include' | 'exclude'
}

const getOrganisationSummary = async ({
  organisationId,
  startDate,
  endDate,
  extraOrgId,
  extraOrgMode,
}: GetOrganisationSummaryParams) => {
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

interface GetChildOrganisationsParams {
  organisationId: string
  startDate: string
  endDate: string
  organisationIds: string[]
  universityWideAccess: boolean
  extraOrgId?: string
  extraOrgMode?: 'include' | 'exclude'
}

const getChildOrganisations = async ({
  organisationId,
  startDate,
  endDate,
  organisationIds,
  universityWideAccess,
  extraOrgId,
  extraOrgMode,
}: GetChildOrganisationsParams) => {
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
        include: [
          {
            model: scopedSummary,
            as: 'summaries',
            required: false,
          },
        ],
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

interface GetOrganisationSummaryWithChildOrganisationsParams {
  organisationId: string
  startDate: string
  endDate: string
  universityWideAccess: boolean
  accessibleOrganisationIds: string[]
  extraOrgId?: string
  extraOrgMode?: 'include' | 'exclude'
}

const getOrganisationSummaryWithChildOrganisations = async ({
  organisationId,
  startDate,
  endDate,
  universityWideAccess,
  accessibleOrganisationIds,
  extraOrgId,
  extraOrgMode,
}: GetOrganisationSummaryWithChildOrganisationsParams) => {
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

interface GetOrganisationSummaryWithCourseUnitsParams {
  organisationId: string
  startDate: string
  endDate: string
  tagId?: string
  extraOrgId?: string
  extraOrgMode?: 'include' | 'exclude'
}

const getOrganisationSummaryWithCourseUnits = async ({
  organisationId,
  startDate,
  endDate,
  tagId,
  extraOrgId,
  extraOrgMode,
}: GetOrganisationSummaryWithCourseUnitsParams) => {
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

  organisation.courseUnits = partialCourseUnits.concat(courseUnits as any[]) as any[]

  return organisation
}

interface GetOrganisationSummaryWithTagsParams {
  organisationId: string
  startDate: string
  endDate: string
  extraOrgId?: string
  extraOrgMode?: 'include' | 'exclude'
}

const getOrganisationSummaryWithTags = async ({
  organisationId,
  startDate,
  endDate,
  extraOrgId,
  extraOrgMode,
}: GetOrganisationSummaryWithTagsParams) => {
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

const checkedGetOrganisationSummary = withOrganisationAccessCheck(getOrganisationSummary)
const checkedGetOrganisationSummaryWithChildOrganisations = withOrganisationAccessCheck(
  getOrganisationSummaryWithChildOrganisations
)
const checkedGetOrganisationSummaryWithCourseUnits = withOrganisationAccessCheck(getOrganisationSummaryWithCourseUnits)
const checkedGetOrganisationSummaryWithTags = withOrganisationAccessCheck(getOrganisationSummaryWithTags)

export {
  checkedGetOrganisationSummary as getOrganisationSummary,
  checkedGetOrganisationSummaryWithChildOrganisations as getOrganisationSummaryWithChildOrganisations,
  checkedGetOrganisationSummaryWithCourseUnits as getOrganisationSummaryWithCourseUnits,
  checkedGetOrganisationSummaryWithTags as getOrganisationSummaryWithTags,
}
