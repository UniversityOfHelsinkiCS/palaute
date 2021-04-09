const dateFns = require('date-fns')

const importerClient = require('./importerClient')

const { FeedbackTarget } = require('../models')
// const { Question } = require('../models')

// const defaultQuestions = require('./questions.json')

const formatDate = (date) => dateFns.format(date, 'yyyy-MM-dd')

const acceptedItemTypes = [
  'urn:code:assessment-item-type:teaching-participation',
]

const createFeedbackTargetFromCourseRealisation = async (data) => {
  const { endDate } = data.activityPeriod
  const [course] = await FeedbackTarget.upsert({
    feedbackType: 'courseRealisation',
    typeId: data.id,
    opensAt: endDate,
    closesAt: endDate,
  })
  return course
}

const createFeedbackTargetFromAssessmentItem = async (data) => {
  const [course] = await FeedbackTarget.upsert({
    feedbackType: 'assessmentItem',
    typeId: data.id,
  })
  return course
}

const getResponsibleByPersonId = async (personId, options = {}) => {
  const { startDateBefore, endDateAfter } = options

  const params = {
    ...(startDateBefore && { startDateBefore: formatDate(startDateBefore) }),
    ...(endDateAfter && { endDateAfter: formatDate(endDateAfter) }),
  }

  const { data } = await importerClient.get(
    `/palaute/responsible/${personId}`,
    {
      params,
    },
  )

  const { courseUnitRealisations, assessmentItems } = data

  const feedbackTargets = await Promise.all(
    assessmentItems
      .filter((item) => acceptedItemTypes.includes(item.assessmentItemType))
      .map(async (item) => createFeedbackTargetFromAssessmentItem(item)),
  )

  feedbackTargets.push(
    ...(await Promise.all(
      courseUnitRealisations.map(async (courseRealisation) =>
        createFeedbackTargetFromCourseRealisation(courseRealisation),
      ),
    )),
  )

  const feedbackIds = new Set()

  return feedbackTargets.filter((target) => {
    if (feedbackIds.has(target.id)) return false
    feedbackIds.add(target.id)
    return true
  })
}

module.exports = {
  getResponsibleByPersonId,
}
