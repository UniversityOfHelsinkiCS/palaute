const dateFns = require('date-fns')

const importerClient = require('./importerClient')

const {
  FeedbackTarget,
  CourseUnit,
  UserFeedbackTarget,
  CourseRealisation,
} = require('../models')

const formatDate = (date) => dateFns.format(date, 'yyyy-MM-dd')

const createCourseUnit = async (data) => {
  await CourseUnit.upsert({
    id: data.id,
    name: data.name,
  })
}

const createFeedbackTargetWithUserTargetTable = async (
  feedbackType,
  typeId,
  courseRealisationId,
  courseUnitId,
  name,
  endDate,
  userId,
) => {
  if (feedbackType === 'courseRealisation') {
    await CourseRealisation.upsert({
      id: courseRealisationId,
      endDate,
      name,
    })
  }

  const [feedbackTarget] = await FeedbackTarget.upsert({
    feedbackType,
    typeId,
    courseUnitId,
    courseRealisationId,
    name,
    opensAt: formatDate(dateFns.subDays(endDate, 14)),
    closesAt: formatDate(dateFns.addDays(endDate, 14)),
  })
  await UserFeedbackTarget.findOrCreate({
    where: {
      userId,
      feedbackTargetId: Number(feedbackTarget.id),
    },
    defaults: {
      accessStatus: 'STUDENT',
      userId,
      feedbackTargetId: Number(feedbackTarget.id),
    },
  })
  return feedbackTarget
}

const createFeedbackTargetFromStudyGroup = async (
  data,
  endDate,
  courseUnitId,
  realisationId,
  userId,
) => {
  const target = await createFeedbackTargetWithUserTargetTable(
    'studySubGroup',
    data.id,
    realisationId,
    courseUnitId,
    data.name,
    endDate,
    userId,
  )
  return target
}

const createFeedbackTargetFromCourseRealisation = async (
  data,
  studySubGroupIds,
  courseUnitId,
  userId,
) => {
  const endDate = dateFns.parse(
    data.activityPeriod.endDate,
    'yyyy-MM-dd',
    new Date(),
  )
  await createFeedbackTargetWithUserTargetTable(
    'courseRealisation',
    data.id,
    data.id,
    courseUnitId,
    data.name,
    endDate,
    userId,
  )
  await data.studyGroupSets.reduce(async (prom, studySet) => {
    await prom
    await studySet.studySubGroups
      .filter((group) => studySubGroupIds.includes(group.id))
      .reduce(async (promise, item) => {
        await promise
        await createFeedbackTargetFromStudyGroup(
          item,
          endDate,
          courseUnitId,
          data.id,
          userId,
        )
      }, Promise.resolve())
  }, Promise.resolve())
}

const createTargetsFromEnrolment = async (data, userId) => {
  const studySubGroupIds = data.studySubGroups.map(
    (group) => group.studySubGroupId,
  )

  const { courseUnitId, courseUnitRealisation, courseUnit } = data
  await createCourseUnit(courseUnit)

  await createFeedbackTargetFromCourseRealisation(
    courseUnitRealisation,
    studySubGroupIds,
    courseUnitId,
    userId,
  )
}

// this doesn't return anything, it is easier to do separate query for that
const getEnrolmentByPersonId = async (personId, options = {}) => {
  const { startDateBefore, endDateAfter } = options

  const params = {
    ...(startDateBefore && { startDateBefore: formatDate(startDateBefore) }),
    ...(endDateAfter && { endDateAfter: formatDate(endDateAfter) }),
  }

  const { data } = await importerClient.get(`/palaute/enrolled/${personId}`, {
    params,
  })

  await data.reduce(async (promise, enrolment) => {
    await promise
    await createTargetsFromEnrolment(enrolment, personId)
  }, Promise.resolve())
}

module.exports = {
  getEnrolmentByPersonId,
}
