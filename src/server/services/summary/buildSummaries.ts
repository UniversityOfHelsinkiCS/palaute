import { Op, QueryTypes } from 'sequelize'
import _ from 'lodash'
import { differenceInYears, formatISO, subDays } from 'date-fns'
import {
  Feedback,
  UserFeedbackTarget,
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  Organisation,
  Summary,
  Tag,
  CourseUnitsOrganisation,
  CourseRealisationsOrganisation,
} from '../../models'
import { WORKLOAD_QUESTION_ID, OPEN_UNIVERSITY_ORG_ID } from '../../util/config'
import { sequelize } from '../../db/dbConnection'
import { sumSummaryDatas, mapOptionIdToValue } from './utils'
import { logger } from '../../util/logger'
import { prefixTagId } from '../../util/common'
import { getPeriodDates } from '../../../common/studyPeriods'

/**
 * Find all root organisation ids. There usually should be only one, which in config is UNIVERSITY_ROOT_ID,
 * but we'll get them all from db just in case.
 */
const getRootOrganisations = async () => {
  const rootOrgs = await Organisation.findAll({
    attributes: ['id'],
    where: {
      parentId: null,
    },
  })
  return rootOrgs.map(org => org.id)
}

/**
 * Get the ids of all relevant questions for summaries.
 * These are all the LIKERT and WORKLOAD questions in university or programme level surveys.
 * Other types of questions are not displayed.
 */
const getRelevantQuestionIds = async () => {
  const questions = await sequelize.query<{ id: number }>(
    `
    SELECT q.id
    FROM surveys s
    INNER JOIN questions q ON q.id = ANY (s.question_ids)
    WHERE (s.type = 'university' OR s.type = 'programme')
    AND q.type = 'LIKERT' OR q.id = :workloadQuestionId;
  `,
    { type: QueryTypes.SELECT, replacements: { workloadQuestionId: WORKLOAD_QUESTION_ID } }
  )

  const questionIds = questions.map(q => q.id)

  return new Set(questionIds) // It is important that there are no duplicates.
}

/**
 * Finds out the extraOrgIds that are responsible for this CUR
 */
const getCurExtraOrgIds = (
  courseUnitOrganisationIds: string[],
  courseRealisationOrganisationIds: string[],
  extraOrgIds: string[]
) =>
  extraOrgIds.filter(
    orgId => courseUnitOrganisationIds.includes(orgId) || courseRealisationOrganisationIds.includes(orgId)
  )

/**
 * Yields the 1 or 2 variants of this entity, based on extraOrgId.
 * If for example extraOrgId === OPEN_UNI_ORG_ID, one variant would have open uni fbtSums and the other non-open uni fbtSums.
 * If fbtSums of entity are one or another, only one entity would be yielded.
 */
const getExtraOrgVariants = (entity: any, extraOrgId: string) =>
  _.partition(entity.feedbackTargets, fbtsum => fbtsum.extraOrgIds.includes(extraOrgId))
    .filter(fbtSums => fbtSums.length > 0)
    .map(fbtSums => ({
      ..._.clone(entity),
      feedbackTargets: fbtSums,
    }))

interface BuildSummariesForPeriodParams {
  startDate: Date
  endDate: Date
  rootOrganisations: string[]
  relevantQuestionIds: Set<number>
  transaction: any
  separateOrgId: string
}

const buildSummariesForPeriod = async ({
  startDate,
  endDate,
  rootOrganisations,
  relevantQuestionIds,
  transaction,
  separateOrgId,
}: BuildSummariesForPeriodParams) => {
  // ---------------- Phase 1: ------------------
  // Build summary entities from feedbacks for courses during this time period
  // We do this for the following entities, from "bottom up":
  // 1. course realisations (built from feedback data)
  // 2. course units (built from CURs)
  // 3. course unit groups (--||--)
  // 4. tags (--||--)
  // 5. organisations
  //
  // This should be quite extensible should we want to add more different entities in the future.
  // Since the initial version, I've already added cu groups and tags.

  // Get all the feedback data and associated entities for this period. Then the rest is done JS side.
  const feedbackTargets = await FeedbackTarget.findAll({
    include: [
      {
        model: CourseRealisation,
        attributes: ['id', 'startDate', 'endDate'],
        as: 'courseRealisation',
        required: true,
        // separate: true,  // Tested, did not improve performance
        where: {
          [Op.or]: [
            // Any overlap with the period
            {
              // Case: CUR starts during the period
              startDate: {
                [Op.between]: [startDate, endDate],
              },
            },
            {
              // Case: CUR ends during the period
              endDate: {
                [Op.between]: [startDate, endDate],
              },
            },
            {
              // Case: CUR starts before and ends after the period
              [Op.and]: [
                {
                  startDate: {
                    [Op.lte]: startDate,
                  },
                },
                {
                  endDate: {
                    [Op.gte]: endDate,
                  },
                },
              ],
            },
          ],
        },
        include: [
          {
            model: CourseRealisationsOrganisation,
            as: 'courseRealisationsOrganisations',
            // attributes: ['organisationId'], // Weird Sequelize thing #1, see below for more...
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['id'],
          },
        ],
      },
      {
        model: CourseUnit,
        attributes: ['id', 'groupId'],
        as: 'courseUnit',
        required: true,
        // separate: true, // Tested, did not improve performance
        include: [
          {
            model: CourseUnitsOrganisation,
            as: 'courseUnitsOrganisations',
            attributes: ['organisationId'],
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['id'],
          },
        ],
      },
      {
        model: UserFeedbackTarget,
        attributes: ['id'],
        as: 'userFeedbackTargets',
        where: {
          accessStatus: 'STUDENT',
        },
        required: true,
        separate: true, // Tested, DID improve performance
        include: [
          {
            model: Feedback,
            attributes: ['data', 'createdAt'],
            as: 'feedback',
          },
        ],
      },
    ],
    transaction,
  })

  // Start summing the stuff for feedback targets
  const feedbackTargetsSummaries = []

  for (const fbt of feedbackTargets) {
    // Ignore those that have no students
    // eslint-disable-next-line no-continue
    if (!fbt.userFeedbackTargets.length) continue

    const result: Record<string, { mean: number; distribution: Record<string, number> }> = {}

    // Go through each feedback of fbt
    for (const ufbt of fbt.userFeedbackTargets) {
      if (ufbt.feedback) {
        for (const { data, questionId } of ufbt.feedback.data) {
          if (typeof data !== 'string') continue

          // Only consider LIKERT & WORKLOAD questions
          if (relevantQuestionIds.has(questionId)) {
            // Initialise question data
            if (!result[questionId]) {
              result[questionId] = {
                mean: 0,
                distribution: {},
              }
            }

            // data is the option id, 0-5 for likert and ids for single choice (WORKLOAD)
            result[questionId].distribution[data] = (result[questionId].distribution[data] ?? 0) + 1
          }
        }
      }
    }

    // Compute the mean (which we've initialised to 0) for each question.
    // Keep in mind that value of 0 for LIKERT means NO ANSWER, its not counted to mean.
    // WORKLOAD has no such option, are values are actual values.
    const questionIds = Object.keys(result)
    for (const questionId of questionIds) {
      const optionIds = Object.keys(result[questionId].distribution)
      let totalCount = 0
      let sum = 0
      for (const optionId of optionIds) {
        if (Number(optionId) !== 0) {
          // skip the NO ANSWER option
          const count = Number(result[questionId].distribution[optionId])
          totalCount += count
          sum += mapOptionIdToValue(optionId, questionId) * count
        }
      }
      result[questionId].mean = totalCount > 0 ? sum / totalCount : 0
    }

    const curOrgIds = fbt.courseRealisation.courseRealisationsOrganisations.map(curo => curo.organisationId)
    const cuOrgIds = fbt.courseUnit.courseUnitsOrganisations.map(cuo => cuo.organisationId)

    feedbackTargetsSummaries.push({
      entityId: fbt.id.toString(),
      entityType: 'feedbackTarget',
      userCreated: fbt.userCreated,
      feedbackTargetId: fbt.id,
      data: {
        result,
        studentCount: fbt.userFeedbackTargets.length,
        hiddenCount: fbt.hiddenCount,
        feedbackCount: fbt.userFeedbackTargets.filter(ufbt => ufbt.feedback).length,
        feedbackResponsePercentage: fbt.feedbackResponse?.length ? 1 : 0,
      },
      courseRealisationId: fbt.courseRealisation.id,
      courseUnitId: fbt.courseUnit.id,
      courseUnitGroupId: fbt.courseUnit.groupId,
      curOrgIds,
      cuOrgIds,
      curTags: fbt.courseRealisation.tags,
      cuTags: fbt.courseUnit.tags,
      extraOrgIds: getCurExtraOrgIds(curOrgIds, cuOrgIds, [separateOrgId]),
    })
  } // FBTs are now done and we could write FBTs summaries to db. But we leave db operations to the end.

  const basicFeedbackTargetSummaries = feedbackTargetsSummaries.filter(fbt => !fbt.userCreated)

  // Make the initial CUR summaries.
  const courseRealisationSummaries = Object.entries(
    _.groupBy(basicFeedbackTargetSummaries, fbtsum => fbtsum.courseRealisationId)
  )
    .map(([curId, feedbackTargets]) => ({
      entityId: curId,
      entityType: 'courseRealisation',
      feedbackTargets: _.uniqBy(feedbackTargets, 'feedbackTargetId'),
    }))
    .flatMap(cu => getExtraOrgVariants(cu, separateOrgId))

  // Sum them up from FBTs. Then we're done with CURs and could write CUR summaries to db.
  for (const cur of courseRealisationSummaries) {
    const { feedbackTargets } = cur
    delete cur.feedbackTargets // Now not needed anymore

    cur.data = sumSummaryDatas(feedbackTargets.map((fbtsum: any) => fbtsum.data))
    cur.extraOrgIds = _.uniq(feedbackTargets.flatMap((fbtsum: any) => fbtsum.extraOrgIds))
  }

  // Make the initial CU summaries.
  const courseUnitSummaries = Object.entries(_.groupBy(basicFeedbackTargetSummaries, fbtsum => fbtsum.courseUnitId))
    .map(([cuId, feedbackTargets]) => ({
      entityId: cuId,
      entityType: 'courseUnit',
      feedbackTargets: _.uniqBy(feedbackTargets, 'feedbackTargetId'),
    }))
    .flatMap(cu => getExtraOrgVariants(cu, separateOrgId))

  // Sum them up from FBTs. Then we're done with CUs and could write CU summaries to db.
  for (const cu of courseUnitSummaries) {
    const { feedbackTargets } = cu
    delete cu.feedbackTargets // Now not needed anymore

    cu.data = sumSummaryDatas(feedbackTargets.map((fbtsum: any) => fbtsum.data))
    cu.extraOrgIds = _.uniq(feedbackTargets.flatMap((fbtsum: any) => fbtsum.extraOrgIds))
  }

  // Very cool. Now make the initial CU group summaries, just like we did for CUs, but using groupId instead of id.
  const courseUnitGroupSummaries = Object.entries(
    _.groupBy(basicFeedbackTargetSummaries, fbtsum => fbtsum.courseUnitGroupId)
  )
    .map(([cuGroupId, feedbackTargets]) => ({
      entityId: cuGroupId,
      entityType: 'courseUnitGroup',
      feedbackTargets: _.uniqBy(feedbackTargets, 'feedbackTargetId'),
    }))
    .flatMap(cuGroup => getExtraOrgVariants(cuGroup, separateOrgId))

  // Sum them up from CURs. Then we're done with CU groups and could write CU group summaries to db.
  for (const cuGroup of courseUnitGroupSummaries) {
    const { feedbackTargets } = cuGroup
    delete cuGroup.feedbackTargets // Now not needed anymore

    cuGroup.data = sumSummaryDatas(feedbackTargets.map((fbtsum: any) => fbtsum.data))
    cuGroup.extraOrgIds = _.uniq(feedbackTargets.flatMap((fbtsum: any) => fbtsum.extraOrgIds))
  }

  // Make the initial tag summaries. Tags have course realisations directly, and through course unit association.
  const tagSummaries = _.uniqBy(
    basicFeedbackTargetSummaries.flatMap(fbtsum => [...fbtsum.curTags, ...fbtsum.cuTags]),
    'id'
  )
    .map(tag => ({
      entityId: prefixTagId(tag.id),
      entityType: 'tag',
      feedbackTargets: _.uniqBy(
        basicFeedbackTargetSummaries.filter(
          fbtsum => fbtsum.curTags.some(t => t.id === tag.id) || fbtsum.cuTags.some(t => t.id === tag.id)
        ),
        'feedbackTargetId'
      ),
    }))
    .flatMap(tag => getExtraOrgVariants(tag, separateOrgId))

  // Sum them up from CURs. Then we're done with tags and could write tag summaries to db.
  for (const tag of tagSummaries) {
    const { feedbackTargets } = tag
    delete tag.feedbackTargets // Now not needed anymore

    tag.data = sumSummaryDatas(feedbackTargets.map((fbtsum: any) => fbtsum.data))
    tag.extraOrgIds = _.uniq(feedbackTargets.flatMap((fbtsum: any) => fbtsum.extraOrgIds))
  }

  // Make the initial org summaries. These are the orgs that are responsible for some courses.
  const orgIds = _.uniq(basicFeedbackTargetSummaries.flatMap(fbtsum => [...fbtsum.cuOrgIds, ...fbtsum.curOrgIds]))
  const orgs = await Organisation.findAll({ attributes: ['id', 'parentId'], where: { id: orgIds } })
  const orgSummaries = orgs.map(org => ({
    entityId: org.id,
    entityType: 'organisation',
    parentId: org.parentId,
    parent: null as any,
    feedbackTargets: _.uniqBy(
      basicFeedbackTargetSummaries.filter(
        fbtsum => fbtsum.curOrgIds.includes(org.id) || fbtsum.cuOrgIds.includes(org.id)
      ),
      'feedbackTargetId'
    ),
  }))

  // ---------------- Phase 2 (organisations): ------------------
  // Now we're done with the base layer, FBTs, CURs, CUs and their direct responsible organisations,
  // and can start the generalising step where we
  // 1. iteratively find parent organisations of all found organisations.
  // 2. populate their CURs that their child organisations are responsible for. (Above we already populated their directly responsible courses)
  // 3. sum up the CUR datas to create final summaries.

  let maxIterations = 10 // Assume that the organisation structure is no deeper than this. Seems safe, HY gets 2 iterations at most.

  do {
    // Find parent from list for each organisation. Also find parent org ids that are not in the list
    const orgsMissingParentOrgs: typeof orgSummaries = []
    orgSummaries.forEach(org => {
      if (org.parent) return // Parent already found for this...
      org.parent = orgSummaries.find(o => o.entityId === org.parentId)
      if (!org.parent) orgsMissingParentOrgs.push(org) // Parent not in the list. We need to get its parent from db...
    })

    // eslint-disable-next-line no-loop-func
    if (orgsMissingParentOrgs.every(org => rootOrganisations.includes(org.entityId))) {
      break // Done! Only root organisations left and they got no parents.
    }

    // Find the missing parents...
    const newParentOrgs = await Organisation.findAll({
      attributes: ['id', 'parentId'],
      where: {
        id: {
          [Op.in]: orgsMissingParentOrgs.map(o => o.parentId),
        },
      },
      transaction,
    })

    // And add them to the list. Next iteration their children will be joined to them.
    newParentOrgs.forEach(org => {
      orgSummaries.push({
        entityId: org.id,
        entityType: 'organisation',
        parentId: org.parentId,
        parent: null,
        feedbackTargets: [],
      })
    })
  } while (maxIterations-- > 0)

  // The org tree structure is now built.
  // We next need to populate the CURs of parent orgs from bottom orgs that have CURs directly under them.
  // To do this, start from leaf orgs: they are not a parent to any org. Then recursively go up from them until a root node is reached.

  /**
   * Add CURs of organisation's parent from organisation, and then do the same for parent, recursively
   */
  const populateParentsCURs = (organisation: (typeof orgSummaries)[number]) => {
    const { parent } = organisation
    if (!parent) return // organisation is a root
    parent.feedbackTargets = _.uniqBy(parent.feedbackTargets.concat(organisation.feedbackTargets), 'feedbackTargetId')
    populateParentsCURs(parent)
  }

  for (const organisation of orgSummaries) {
    // is it a leaf?
    if (!orgSummaries.some(org => org.parentId === organisation.entityId)) {
      // Its a leaf. Now start adding its CURs to its parent recursively.
      populateParentsCURs(organisation)
    }
  }

  const orgSummariesWithVariants = orgSummaries.flatMap(org => getExtraOrgVariants(org, separateOrgId))

  // Now we can actually calculate the org summaries from each org's CURs
  for (const org of orgSummariesWithVariants) {
    org.data = sumSummaryDatas(org.feedbackTargets.map((fbtsum: any) => fbtsum.data))
    org.extraOrgIds = _.uniq(org.feedbackTargets.flatMap((fbtsum: any) => fbtsum.extraOrgIds))
    delete org.feedbackTargets
    delete org.parent
  }

  type SummaryCreateParams = {
    entityId: string
    entityType: string
    feedbackTargetId: number
    data: any
    extraOrgIds: string[]
  }
  const relevantFields = ['entityId', 'entityType', 'feedbackTargetId', 'data', 'extraOrgIds']
  const allSummaries = feedbackTargetsSummaries
    .concat(courseRealisationSummaries)
    .concat(courseUnitSummaries)
    .concat(courseUnitGroupSummaries)
    .concat(tagSummaries)
    .concat(orgSummariesWithVariants)
    .filter(summary => summary.data && summary.data.studentCount > 0)
    .map(summary => _.pick(summary, relevantFields) as SummaryCreateParams)
    .map(summary => ({ ...summary, startDate: formatISO(startDate), endDate: formatISO(endDate) }))

  // Write all summaries to db.
  await Summary.bulkCreate(allSummaries, { transaction })
}

const summariesHaveToBeFullyRebuilt = async () => {
  // If there are no summaries, they have to be built.
  // Also if there are summaries but they date back to more than 1 year, we should rebuild everything
  const latestSummary = await Summary.findOne({
    order: [['startDate', 'DESC']],
  })
  if (!latestSummary) {
    return true
  }

  const diff = differenceInYears(new Date(), new Date(latestSummary.endDate))
  if (diff > 0) {
    return true
  }
  return false
}

/**
 * Build summaries for all organisations, CUs and CURs.
 * Summary rows will be created for each time period.
 *
 * Possible time periods are:
 * All semesters starting from some defined year.
 * All academic years starting from some defined year.
 *
 * This means that there will be possibly multiple summary rows for each organisation, CU and CURs,
 * depending on from how many periods they have data from.
 *
 * For example, if organisation has CURs from between 2021S and 2023S, there will be
 * Semesters 2021S, 2022K, 2022S, 2023K, 2023S, and...
 * Academic years 2021, 2022, 2023.
 * (in total 8)
 *
 * These represent all the different possible time period "views" the user can select in a summary view to see.
 *
 * If one would want to see periods of two years, summaries for 2021+2022 and 2023+2024 would have to be constructed in addition.
 */
export const buildSummaries = async (forceAll = false) => {
  let datePeriods = (() => {
    const startYear = 2020 // Nothing ending before this is considered
    const endYear = new Date().getFullYear() // Nothing ending after this is considered

    const dates = []
    for (let year = startYear; year <= endYear; year++) {
      const startOfSpringSemester = new Date(`${year}-01-01`)
      const startOfAutumnSemester = new Date(`${year}-08-01`)
      const startOfNextSpringSemester = new Date(`${year + 1}-01-01`)
      const endOfAcademicYear = new Date(`${year + 1}-07-31`)

      dates.push({
        // kevät
        start: startOfSpringSemester,
        end: subDays(startOfAutumnSemester, 1),
      })
      dates.push({
        // syys
        start: startOfAutumnSemester,
        end: subDays(startOfNextSpringSemester, 1),
      })
      dates.push({
        // full academic year
        start: startOfAutumnSemester,
        end: endOfAcademicYear,
      })
    }

    const studyPeriods = getPeriodDates(new Date())
    for (const studyPeriod of studyPeriods) {
      dates.push(studyPeriod)
    }

    return dates
  })()

  const rebuildAll = forceAll || (await summariesHaveToBeFullyRebuilt())

  if (!rebuildAll) {
    // Only rebuild summaries for the "current" time periods. Those are the ones that end in the future.
    // Let's also add 6 months of past
    const T = new Date()
    T.setMonth(T.getMonth() - 6)
    datePeriods = datePeriods.filter(({ end }) => end > T)
    logger.info(`Rebuilding summaries for ${datePeriods.length} time periods.`)
  } else {
    logger.info('Rebuilding summaries fully.')
  }

  // Initialize root organisations and relevant question ids
  const rootOrganisations = await getRootOrganisations()
  const relevantQuestionIds = await getRelevantQuestionIds()

  // Build summaries for each time period
  for (const { start, end } of datePeriods) {
    await sequelize.transaction(async transaction => {
      // Delete old summaries for this period. Remember that summary dates are exact, we dont want to delete anything "in between".
      await Summary.destroy({
        where: {
          startDate: start,
          endDate: end,
        },
        transaction,
      })
      await buildSummariesForPeriod({
        startDate: start,
        endDate: end,
        rootOrganisations,
        relevantQuestionIds,
        transaction,
        separateOrgId: OPEN_UNIVERSITY_ORG_ID,
      })
    })
  }
}
