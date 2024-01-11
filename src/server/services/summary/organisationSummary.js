const { subMonths } = require('date-fns')
const _ = require('lodash')

const { TAGS_ENABLED } = require('../../util/config')
const { runOrganisationSummaryQuery } = require('./sql')
const { getMean, getTagIds, getRowAverage } = require('./utils')

const includeEmptyOrganisations = (organisations, organisationsToShow, questions) => {
  const missingOrganisations = organisationsToShow.filter(
    org => !organisations.find(otherOrg => org.id === otherOrg.id)
  )

  const allOrganisations = organisations.concat(
    missingOrganisations.map(org => ({
      id: org.id,
      name: org.name,
      code: org.code,
      courseUnits: [],
      results: questions.map(({ id: questionId }) => ({
        questionId,
        mean: 0,
        distribution: {},
      })),
      feedbackCount: 0,
      studentCount: 0,
      feedbackPercentage: 0,
      feedbackResponsePercentage: 0,
    }))
  )

  return _.orderBy(allOrganisations, [org => (org.courseUnits.length > 0 ? 1 : 0)], ['desc'])
}

const getOrganisationSummaries = async ({
  questions,
  organisationAccess,
  accessibleCourseRealisationIds = [],
  includeOpenUniCourseUnits = true,
  tagId,
  startDate = subMonths(new Date(), 24),
  endDate = new Date(),
}) => {
  // orgs user has org access to
  const organisationsToShow = organisationAccess.map(org => org.organisation)

  const organisationIds = organisationsToShow.map(org => org.id)

  // rows for each CU with its associated CURs in json
  const rows = await runOrganisationSummaryQuery({
    organisationIds,
    courseRealisationIds: accessibleCourseRealisationIds,
    startDate,
    endDate,
    includeOpenUniCourseUnits,
  })

  const initialResults = questions.map(q => ({
    questionId: q.id,
    mean: 0,
    distribution: {},
  })) // results object template, array with objects for each questions distribution and mean

  // aggregate CU stats from CUR rows. Also find info about the current (latest) feedback target
  let summedCourseUnits = rows.map(cu => {
    const results = JSON.parse(JSON.stringify(initialResults))
    let feedbackCount = 0
    let studentCount = 0
    let hiddenCount = 0
    // current info
    let currentFeedbackTargetId = null
    let closesAt = null
    let feedbackResponseGiven = false
    // used for finding the latest fbt with the most feedbacks
    let currentRank = -1

    // sum all CURs
    cu.courseRealisations.forEach(cur => {
      // iterate over each question
      results.forEach(questionResult => {
        const { questionId } = questionResult
        const indexOfQuestion = cur.questionIds.indexOf(questionId)

        // sum the distributions
        if (indexOfQuestion !== -1 && typeof cur.distribution[indexOfQuestion] === 'object')
          Object.entries(cur.distribution[indexOfQuestion]).forEach(([option, count]) => {
            questionResult.distribution[option] = Number(count) + (questionResult.distribution[option] || 0)
          })
      })

      // check if this is more likely the latest fbt
      const rank = Date.parse(cur.startDate) * 10_000 + cur.feedbackCount
      if (rank > currentRank) {
        currentFeedbackTargetId = cur.feedbackTargetId
        closesAt = cur.closesAt
        feedbackResponseGiven = cur.feedbackResponseGiven
        currentRank = rank
      }

      feedbackCount += Number(cur.feedbackCount)
      studentCount += Number(cur.studentCount)
      hiddenCount += Number(cur.hiddenCount)
    }, initialResults)

    // compute mean for each question
    results.forEach(questionResult => {
      questionResult.mean = getMean(
        questionResult.distribution,
        questions.find(q => q.id === questionResult.questionId)
      )
    })

    return {
      id: cu.id,
      organisationId: cu.organisationId,
      organisationName: cu.organisationName,
      organisationCode: cu.organisationCode,
      courseCode: cu.courseCode,
      name: cu.courseUnitName,
      feedbackCount,
      hiddenCount,
      studentCount,
      results,
      currentFeedbackTargetId,
      closesAt,
      feedbackResponseGiven,
      questionIds: cu.courseRealisations[0].questionIds,
      courseRealisations: cu.courseRealisations,
    }
  })

  const organisationCode = organisationAccess[0]?.organisation?.code
  // only filter by tag for specifically configured organisations
  const filterByTag =
    organisationAccess.length === 1 && TAGS_ENABLED.includes(organisationCode) && tagId && tagId !== 'All'

  if (filterByTag) {
    // get CUR and CU tags for each CU
    summedCourseUnits = await Promise.all(
      summedCourseUnits.map(async cu => ({
        ..._.omit(cu, ['courseRealisations']),
        tagIds: await getTagIds(cu),
      }))
    )

    // Filter CUs by tag
    summedCourseUnits = summedCourseUnits.filter(cu => cu.tagIds.includes(Number(tagId)))
  }

  // object with keys as org ids and values as arrays of CUs
  const organisations = _.groupBy(summedCourseUnits, cu => cu.organisationId)

  // aggregate org stats from CUs
  const summedOrganisations = Object.entries(organisations).map(([organisationId, courseUnits]) => ({
    name: courseUnits[0].organisationName,
    id: organisationId,
    code: courseUnits[0].organisationCode,
    courseUnits: _.orderBy(courseUnits, 'courseCode'),
    ...getRowAverage(courseUnits, initialResults, questions),
  }))

  let averageRow
  if (summedOrganisations.length > 1) {
    averageRow = {
      name: { fi: 'Keskiarvo', en: 'Average', sv: 'Medel' },
      id: 1,
      code: 1,
      ...getRowAverage(summedOrganisations, initialResults, questions),
    }
  }

  const withEmptyOrganisations = includeEmptyOrganisations(summedOrganisations, organisationsToShow, questions)

  return {
    averageRow,
    organisations: _.orderBy(withEmptyOrganisations, 'code'),
  }
}

module.exports = getOrganisationSummaries
