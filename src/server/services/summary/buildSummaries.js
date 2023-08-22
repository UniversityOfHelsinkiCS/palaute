/* eslint-disable no-continue */
const { Op, QueryTypes } = require('sequelize')
const datefns = require('date-fns')
const _ = require('lodash')
const {
  Feedback,
  UserFeedbackTarget,
  FeedbackTarget,
  CourseRealisation,
  CourseUnit,
  Organisation,
  Summary,
} = require('../../models')
const { WORKLOAD_QUESTION_ID } = require('../../util/config')
const { sequelize } = require('../../db/dbConnection')

const startYear = 2021 // Nothing ending before this is considered
const endYear = new Date().getFullYear() // Nothing ending after this is considered
const splitMonth = '08'

// Todo not reliable
let rootOrganisations = []
;(async () => {
  const rootOrgs = await Organisation.findAll({
    attributes: ['id'],
    where: {
      parentId: null,
    },
  })
  rootOrganisations = rootOrgs.map(org => org.id)
})()

const datePeriods = (() => {
  const dates = []
  for (let year = startYear; year <= endYear; year++) {
    dates.push({
      // kevät
      start: new Date(`${year}-01-01`),
      end: new Date(`${year}-${splitMonth}-01`),
    })
    dates.push({
      // syys
      start: new Date(`${year}-${splitMonth}-01`),
      end: new Date(`${year}-12-31`),
    })
  }
  return dates
})()

// Todo not reliable
let relevantQuestionIds = null
;(async () => {
  const [questions] = await sequelize.query(
    `
    SELECT q.id
    FROM surveys s
    INNER JOIN questions q ON q.id = ANY (s.question_ids)
    WHERE (s.type = 'university' OR s.type = 'programme')
    AND q.type = 'LIKERT';
  `,
    { queryType: QueryTypes.SELECT }
  )

  const questionIds = questions.map(q => q.id)
  questionIds.push(WORKLOAD_QUESTION_ID)

  relevantQuestionIds = new Set(questionIds)
})()

const sumLikertResults = (...results) => {
  const distribution = {}

  for (const result of results) {
    Object.entries(result.distribution).forEach(([optionId, count]) => {
      distribution[optionId] = (distribution[optionId] ?? 0) + count
    })
  }

  let totalValue = 0
  let totalAnsweredCount = 0
  Object.entries(distribution).forEach(([optionId, count]) => {
    if (Number(optionId) !== 0) {
      totalValue += count * Number(optionId)
      totalAnsweredCount += count
    }
  })

  return {
    mean: totalAnsweredCount > 0 ? totalValue / totalAnsweredCount : 0,
    distribution,
  }
}

const sumSummaryDatas = summaryDatas => {
  const data = {
    result: {},
    studentCount: 0,
    hiddenCount: 0,
    feedbackCount: 0,
    feedbackResponsePercentage: 0,
  }

  for (const summaryData of summaryDatas) {
    data.studentCount += summaryData.studentCount
    data.hiddenCount += summaryData.hiddenCount
    data.feedbackCount += summaryData.feedbackCount
    data.feedbackResponsePercentage += summaryData.feedbackResponsePercentage

    for (const questionId of Object.keys(summaryData.result)) {
      if (!data.result[questionId]) {
        data.result[questionId] = {
          mean: 0,
          distribution: {},
        }
      }

      data.result[questionId] = sumLikertResults(data.result[questionId], summaryData.result[questionId])
    }
  }

  data.feedbackResponsePercentage /= summaryDatas.length

  return data
}

const buildSummariesForPeriod = async (startDate, endDate) => {
  // ---------------- Phase 1: ------------------
  // Build course realisation, course unit and organisation summaries from feedbacks for courses during this time period

  const feedbackTargets = await FeedbackTarget.findAll({
    include: [
      {
        model: CourseRealisation,
        attributes: ['id', 'startDate', 'endDate'],
        as: 'courseRealisation',
        required: true,
        where: {
          startDate: {
            [Op.between]: [startDate, endDate], // We might want to discuss this
          },
        },
        include: {
          model: Organisation,
          as: 'organisations',
          attributes: ['id', 'parentId'],
        },
      },
      {
        model: CourseUnit,
        attributes: ['id'],
        as: 'courseUnit',
        required: true,
        include: {
          model: Organisation,
          as: 'organisations',
          attributes: ['id', 'parentId'],
        },
      },
      {
        model: UserFeedbackTarget,
        attributes: ['id'],
        as: 'userFeedbackTargets',
        where: {
          accessStatus: 'STUDENT',
        },
        required: true,
        include: {
          model: Feedback,
          attributes: ['data'],
          as: 'feedback',
        },
      },
    ],
    // limit: 100,
  })

  // Start summing the stuff for course realisations
  const courseRealisationSummaries = []

  for (const fbt of feedbackTargets) {
    // Ignore those that have no students
    // eslint-disable-next-line no-continue
    if (!fbt.userFeedbackTargets.length > 0) continue

    const result = {}

    // Go through each feedback of fbt
    for (const ufbt of fbt.userFeedbackTargets) {
      if (ufbt.feedback) {
        for (const { data, questionId } of ufbt.feedback.data) {
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

    // Compute the mean (which we've initialised to 0) for each question. Two cases: LIKERT (easy) and WORKLOAD (a slight pain)
    // Keep in mind that value of 0 for LIKERT means NO ANSWER, its not counted to mean.
    // WORKLOAD has no such option, are values are actual values.
    const questionIds = Object.keys(result)
    for (const questionId of questionIds) {
      const optionIds = Object.keys(result[questionId].distribution)
      if (Number(questionId) === WORKLOAD_QUESTION_ID) {
        // different shit. Need to know which uuid type optionIds correspond to which values.
      } else {
        let totalCount = 0
        let sum = 0
        for (const optionId of optionIds) {
          if (Number(optionId) !== 0) {
            // skip the NO ANSWER option
            const count = result[questionId].distribution[optionId]
            totalCount += count
            sum += Number(optionId) * count // For LIKERT, optionId is the value
          }
        }
        result[questionId].mean = totalCount > 0 ? sum / totalCount : 0
      }
    }

    courseRealisationSummaries.push({
      entityId: fbt.courseRealisation.id,
      startDate: fbt.courseRealisation.startDate,
      endDate: fbt.courseRealisation.endDate,
      data: {
        result,
        studentCount: fbt.userFeedbackTargets.length,
        hiddenCount: fbt.hiddenCount,
        feedbackCount: fbt.feedbackCount,
        feedbackResponsePercentage: Number(fbt.feedbackResponseEmailSent),
      },
      courseUnitId: fbt.courseUnit.id,
      curOrganisations: fbt.courseRealisation.organisations.map(org => _.pick(org, ['id', 'parentId'])),
      cuOrganisations: fbt.courseUnit.organisations.map(org => _.pick(org, ['id', 'parentId'])),
    })
  } // CURs are now done and we could write CUR summaries to db. But we leave db operations to the end.

  // Make the initial CU summaries.
  const courseUnitSummaries = Object.entries(_.groupBy(courseRealisationSummaries, cur => cur.courseUnitId)).map(
    ([cuId, courseRealisations]) => ({
      entityId: cuId,
      courseRealisations: _.uniqBy(courseRealisations, 'id'),
    })
  )

  // Sum them up from CURs. Then we're done with CUs and could write CU summaries to db.
  for (const cu of courseUnitSummaries) {
    const { courseRealisations } = cu
    delete cu.courseRealisations // Now not needed anymore

    cu.data = sumSummaryDatas(courseRealisations.map(cur => cur.data))
    cu.startDate = datefns.min(courseRealisations.map(cur => cur.startDate))
    cu.endDate = datefns.max(courseRealisations.map(cur => cur.endDate))
  }

  // Make the initial org summaries. These are the orgs that are responsible for some courses.
  const orgSummaries = _.uniqBy(
    courseRealisationSummaries.flatMap(cur => [...cur.cuOrganisations, ...cur.curOrganisations]),
    'id'
  ).map(org => ({
    entityId: org.id,
    parentId: org.parentId,
    parent: null,
    courseRealisations: _.uniqBy(
      courseRealisationSummaries.filter(
        cur => cur.curOrganisations.some(o => o.id === org.id) || cur.cuOrganisations.some(o => o.id === org.id)
      ),
      'entityId'
    ),
  }))

  // ---------------- Phase 2: ------------------
  // Now we're done with the base layer, CURs, CUs and their direct responsible organisations,
  // and can start the generalising step where we
  // 1. iteratively find parent organisations of all found organisations.
  // 2. populate their CURs that their child organisations are responsible for. (Above we already populated their directly responsible courses)
  // 3. sum up the CUR datas to create final summaries.

  let maxIterations = 10 // Assume that the organisation structure is no deeper than this. Seems safe, HY gets 2 iterations at most.

  do {
    // Find parent from list for each organisation. Also find parent org ids that are not in the list
    const orgsMissingParentOrgs = []
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
    })

    // And add them to the list. Next iteration their children will be joined to them.
    newParentOrgs.forEach(org => {
      orgSummaries.push({
        entityId: org.id,
        parentId: org.parentId,
        parent: null,
        courseRealisations: [],
      })
    })
  } while (maxIterations-- > 0)

  // The org tree structure is now built.
  // We next need to populate the CURs of parent orgs from bottom orgs that have CURs directly under them.
  // To do this, start from leaf orgs: they are not a parent to any org. Then recursively go up from them until a root node is reached.

  /**
   * Add CURs of organisation's parent from organisation, and then do the same for parent, recursively
   */
  const populateParentsCURs = organisation => {
    const { parent } = organisation
    if (!parent) return // organisation is a root
    parent.courseRealisations = _.uniqBy(parent.courseRealisations.concat(organisation.courseRealisations), 'entityId')
    populateParentsCURs(parent)
  }

  for (const organisation of orgSummaries) {
    // is it a leaf?
    if (!orgSummaries.some(org => org.parentId === organisation.entityId)) {
      // Its a leaf. Now start adding its CURs to its parent recursively.
      populateParentsCURs(organisation)
    }
  }

  // Now we can actually calculate the org summaries from each org's CURs
  for (const org of orgSummaries) {
    org.data = sumSummaryDatas(org.courseRealisations.map(cur => cur.data))
    org.startDate = datefns.min(org.courseRealisations.map(cu => cu.startDate))
    org.endDate = datefns.max(org.courseRealisations.map(cu => cu.endDate))
    delete org.courseRealisations
    delete org.parent
  }

  // Write all summaries to db.

  const relevantFields = ['entityId', 'startDate', 'endDate', 'data']
  await Promise.all(
    courseRealisationSummaries
      .map(cur => _.pick(cur, relevantFields))
      .concat(courseUnitSummaries.map(cu => _.pick(cu, relevantFields)))
      .concat(orgSummaries.map(org => _.pick(org, relevantFields)))
      .map(summary => Summary.upsert(summary, summary))
  )
}

const buildSummaries = async () => {
  // First, consider N time spans. Each time span should be for one period.
  // Lets say we have kevät and syys periods for each year, and the split is 01/08/
  // The result will be N different "summary trees", one for each period.
  // If user wants to see summaries from time range spanning multiple periods,
  // the summaries will be summed elementwise. Example: university summary row for time range [2021K, 2022K] = 2021K + 2021S + 2022K

  for (const { start, end } of datePeriods) {
    console.time(`${start.toISOString()}-${end.toISOString()}`)
    await buildSummariesForPeriod(start, end)
    console.timeEnd(`${start.toISOString()}-${end.toISOString()}`)
  }
}

module.exports = {
  buildSummaries,
}
