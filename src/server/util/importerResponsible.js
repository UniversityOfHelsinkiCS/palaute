const dateFns = require('date-fns')

const importerClient = require('./importerClient')

const { FeedbackTarget, CourseUnit } = require('../models')
const logger = require('./logger')
// const { Question } = require('../models')

// const defaultQuestions = require('./questions.json')

const formatDate = (date) => dateFns.format(date, 'yyyy-MM-dd')

const acceptedItemTypes = [
  'urn:code:assessment-item-type:teaching-participation',
]

const createCourseUnit = async (data) => {
  await CourseUnit.upsert({
    id: data.id,
    name: data.name,
  })
}

const createFeedbackTargetFromAssessmentItem = async (data, endDate) => {
  await createCourseUnit(data.courseUnit)
  const [course] = await FeedbackTarget.upsert({
    feedbackType: 'assessmentItem',
    typeId: data.id,
    courseUnitId: data.courseUnit.id,
    name: data.name,
    opensAt: formatDate(dateFns.subDays(endDate, 14)),
    closesAt: formatDate(dateFns.addDays(endDate, 14)),
  })
  return course
}

const createFeedbackTargetFromCourseRealisation = async (
  data,
  assessmentIdToItem,
  shouldCreateTarget,
) => {
  const endDate = dateFns.parse(
    data.activityPeriod.endDate,
    'yyyy-MM-dd',
    new Date(),
  )
  const assessmentItems = await Promise.all(
    data.assessmentItemIds.map(async (id) => {
      if (shouldCreateTarget.has(id)) {
        return createFeedbackTargetFromAssessmentItem(
          assessmentIdToItem.get(id),
          endDate,
        )
      }
      await createCourseUnit(assessmentIdToItem.get(id).courseUnit)
      return { courseUnitId: assessmentIdToItem.get(id).courseUnit.id }
    }),
  )
  const ids = assessmentItems.map((item) => item.courseUnitId)
  if (!ids.every((id) => id === ids[0])) {
    logger.info(
      'AssessmentItems have differing course unit ids!',
      assessmentItems,
    )
  }
  const [course] = await FeedbackTarget.upsert({
    feedbackType: 'courseRealisation',
    typeId: data.id,
    courseUnitId: ids[0],
    name: data.name,
    opensAt: formatDate(dateFns.subDays(endDate, 14)),
    closesAt: formatDate(dateFns.addDays(endDate, 14)),
  })
  assessmentItems.push(course)
  return assessmentItems.filter((item) => item.id)
}

const getAssessmentItemIdsFromCompletionMethods = (data) => {
  const ids = new Set()

  data.forEach((method) => {
    method.assessmentItemIds.forEach((id) => ids.add(id))
  })

  return ids
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

  // Mankelin idea
  // Aloita realisaatioista, joiden assessmentItemIds-taulusta tallennat kaikki itemit
  // AssessmentItemin kautta saadaan ja tallennetaan courseUnit,
  // jonka tietoja käytetään myös realisaatioissa.
  // Tehokkuuden vuoksi luodaan hakemisto, jolla saadaan assessmentItemit tehokkaasti.

  const filteredAssessmentItems = assessmentItems
    .filter((item) => acceptedItemTypes.includes(item.assessmentItemType))
    .filter((item) =>
      getAssessmentItemIdsFromCompletionMethods(
        item.courseUnit.completionMethods,
      ).has(item.id),
    )

  const assessmentIdToItem = new Map()
  const shouldCreateTarget = new Set()

  filteredAssessmentItems.forEach((item) => {
    shouldCreateTarget.add(item.id)
  })

  assessmentItems.forEach((item) => {
    assessmentIdToItem.set(item.id, item)
  })

  return (
    await Promise.all(
      courseUnitRealisations.map(async (realisation) =>
        createFeedbackTargetFromCourseRealisation(
          realisation,
          assessmentIdToItem,
          shouldCreateTarget,
        ),
      ),
    )
  ).flat()
}

module.exports = {
  getResponsibleByPersonId,
}
